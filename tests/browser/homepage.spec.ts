import { expect, test } from "@playwright/test";

test("marks the current route or homepage section in primary navigation", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main menu" });
  const homeLink = navigation.getByRole("link", { name: "Home" });
  const aboutLink = navigation.getByRole("link", { name: "About us" });

  await expect(homeLink).toHaveAttribute("aria-current", "page");
  await aboutLink.click();
  await expect(page).toHaveURL(/#about$/u);
  await expect(aboutLink).toHaveAttribute("aria-current", "location");
  await expect(homeLink).not.toHaveAttribute("aria-current", /.+/u);

  await page.goto("/service-information");
  await expect(
    navigation.getByRole("link", { name: "Service information" }),
  ).toHaveAttribute("aria-current", "page");
});

test("keeps pointer, click and keyboard card state synchronized", async ({ page }) => {
  await page.goto("/#modalities");
  const card = page.getByRole("button", { name: /Counselling/u });
  await expect(card).toHaveAttribute("data-interactive", "true");

  await card.hover();
  await expect(card).toHaveAttribute("aria-expanded", "true");
  await expect(card).toHaveClass(/is-flipped/u);

  await card.click();
  await page.mouse.move(0, 0);
  await expect(card).toHaveAttribute("aria-expanded", "true");

  await card.click();
  await expect(card).toHaveAttribute("aria-expanded", "false");

  await page.mouse.move(0, 0);
  await card.focus();
  await card.press("Enter");
  await expect(card).toHaveAttribute("aria-expanded", "true");
  await card.press("Space");
  await expect(card).toHaveAttribute("aria-expanded", "false");
});

test.describe("narrow mobile viewport", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("keeps navigation, legal links and expanded card details available", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("navigation", { name: "Main menu" }),
    ).toBeVisible();

    for (const title of ["Counselling", "Arts-Based Therapy", "Music Therapy"]) {
      const card = page.getByRole("button", { name: new RegExp(title, "u") });
      await expect(card).toHaveAttribute("data-interactive", "true");
      await card.click();
      await expect(card).toHaveAttribute("aria-expanded", "true");
      await expect(card).toBeVisible();

      const backFace = card.locator(".modality-card-back");
      await expect
        .poll(async () =>
          backFace.evaluate(
            (element) => element.scrollHeight <= element.clientHeight + 1,
          ),
        )
        .toBe(true);
    }

    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Accessibility" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("button", {
        name: /Copy enquiries@swaraagam\.com/u,
      }),
    ).toBeVisible();
  });

  test("keeps legal page headings below the mobile header", async ({ page }) => {
    for (const path of ["/privacy", "/accessibility", "/service-information"]) {
      await page.goto(path);

      const positions = await page.locator(".legal-hero h1").evaluate((heading) => {
        const header = document.querySelector<HTMLElement>(".site-header");
        if (!header) throw new Error("The site header is missing");

        const headingBounds = heading.getBoundingClientRect();
        const headerBounds = header.getBoundingClientRect();
        return { headingTop: headingBounds.top, headerBottom: headerBounds.bottom };
      });

      expect(positions.headingTop).toBeGreaterThanOrEqual(positions.headerBottom - 1);
    }
  });
});
