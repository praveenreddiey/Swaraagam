import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/privacy",
  "/accessibility",
  "/service-information",
  "/page-that-does-not-exist",
] as const;

const responsiveViewports = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

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

test("uses distinct palette roles for hero, booking and back-to-top actions", async ({
  page,
}) => {
  await page.goto("/");

  const colors = await page.evaluate(() => {
    const backgroundColor = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing element: ${selector}`);
      return getComputedStyle(element).backgroundColor;
    };

    const backToTop = document.querySelector<HTMLElement>(".back-to-top");
    if (!backToTop) throw new Error("Missing element: .back-to-top");

    return {
      hero: backgroundColor(".hero-primary-cta"),
      booking: backgroundColor(".header-booking-link"),
      backToTop: getComputedStyle(backToTop).backgroundColor,
      backToTopText: getComputedStyle(backToTop).color,
    };
  });

  expect(colors.hero).toBe("rgb(23, 127, 120)");
  expect(colors.booking).toBe("rgb(120, 87, 216)");
  expect(colors.backToTop).toBe("rgb(248, 189, 50)");
  expect(colors.backToTopText).toBe("rgb(53, 46, 73)");
  expect(colors.hero).not.toBe(colors.booking);

  const footerBottomHeight = await page.locator(".footer-bottom").evaluate(
    (footer) => footer.getBoundingClientRect().height,
  );
  expect(footerBottomHeight).toBeGreaterThanOrEqual(62);
  expect(footerBottomHeight).toBeLessThanOrEqual(66);
});

test("removes optional booking and process labels without leaving layout gaps", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator(".booking-closing p")).toHaveCount(0);
  await expect(page.getByText("Before you go…", { exact: true })).toHaveCount(0);
  await expect(page.locator(".privacy-note")).toHaveCount(0);
  await expect(
    page.getByText("Questions, gently answered", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator(".process-list .step-number > span:not(.line-icon)"),
  ).toHaveText(["01", "02", "03"]);
  await expect(page.locator(".process-list .step-copy > p")).toHaveCount(0);

  const spacing = await page.evaluate(() => ({
    faqTitleMarginTop: Number.parseFloat(
      getComputedStyle(document.querySelector(".faq-heading .section-title")!).marginTop,
    ),
    processHeadingMarginTops: Array.from(
      document.querySelectorAll(".process-list .step-copy h3"),
    ).map((heading) => Number.parseFloat(getComputedStyle(heading).marginTop)),
    bookingHeadingMarginTop: Number.parseFloat(
      getComputedStyle(document.querySelector(".booking-closing h3")!).marginTop,
    ),
    bookingSectionPaddingBottom: Number.parseFloat(
      getComputedStyle(document.querySelector(".booking-section")!).paddingBottom,
    ),
    bookingClosingPadding: [
      Number.parseFloat(
        getComputedStyle(document.querySelector(".booking-closing")!).paddingTop,
      ),
      Number.parseFloat(
        getComputedStyle(document.querySelector(".booking-closing")!).paddingBottom,
      ),
    ],
  }));

  expect(spacing.faqTitleMarginTop).toBe(0);
  expect(spacing.bookingHeadingMarginTop).toBe(0);
  expect(spacing.bookingSectionPaddingBottom).toBe(0);
  expect(spacing.bookingClosingPadding).toEqual([28, 28]);
  expect(spacing.processHeadingMarginTops).toEqual([24, 24, 24]);
});

test("keeps every public route within the viewport at supported widths", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);

    for (const path of publicRoutes) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);

      const pageRoot = page.locator(".site-canvas, .legal-main, .not-found-main").first();
      const dimensions = await pageRoot.evaluate((root) => ({
        bodyWidth: document.body.getBoundingClientRect().width,
        clientWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        rootWidth: root.getBoundingClientRect().width,
        viewportWidth: window.innerWidth,
      }));

      expect(
        dimensions.documentWidth,
        `${path} at ${viewport.width}px: ${JSON.stringify(dimensions)}`,
      ).toBe(dimensions.clientWidth);
      expect(
        dimensions.bodyWidth,
        `${path} at ${viewport.width}px: ${JSON.stringify(dimensions)}`,
      ).toBe(dimensions.clientWidth);
      expect(dimensions.viewportWidth).toBe(viewport.width);
      expect(dimensions.rootWidth).toBe(dimensions.clientWidth);
    }
  }
});

test.describe("narrow mobile viewport", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("keeps navigation, legal links and expanded card details available", async ({
    page,
  }) => {
    await page.goto("/");

    const closingSpacing = await page.locator(".booking-closing").evaluate((closing) => {
      const section = closing.closest(".booking-section");
      if (!section) throw new Error("The booking section is missing");

      const closingStyles = getComputedStyle(closing);
      return {
        closingPadding: [
          Number.parseFloat(closingStyles.paddingTop),
          Number.parseFloat(closingStyles.paddingBottom),
        ],
        sectionPaddingBottom: Number.parseFloat(getComputedStyle(section).paddingBottom),
      };
    });

    expect(closingSpacing.closingPadding).toEqual([24, 24]);
    expect(closingSpacing.sectionPaddingBottom).toBe(0);

    const dateBounds = await page.locator("#preferredDate").evaluate((date) => {
      const field = date.closest(".contact-form");
      if (!field) throw new Error("The enquiry form is missing");

      const dateBounds = date.getBoundingClientRect();
      const formBounds = field.getBoundingClientRect();
      return { dateRight: dateBounds.right, formRight: formBounds.right };
    });

    expect(dateBounds.dateRight).toBeLessThanOrEqual(dateBounds.formRight + 1);

    await expect(
      page.getByRole("navigation", { name: "Main menu" }),
    ).toBeVisible();

    for (const title of ["Counselling", "Arts-Based Therapy", "Music Therapy"]) {
      const card = page.getByRole("button", { name: new RegExp(title, "u") });
      await expect(card.locator(".card-number")).toHaveCount(0);
      await expect(card).toHaveAttribute("data-interactive", "true");
      await card.click();
      await expect(card).toHaveAttribute("aria-expanded", "true");
      await expect(card).toBeVisible();

      const backFace = card.locator(".modality-card-back");
      await expect(backFace.locator(".modality-back-label")).toHaveCount(0);
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
    await expect(
      footer.getByText(/© \d{4} Swaraagam\. All rights reserved\./u),
    ).toBeVisible();
    await expect(footer.getByRole("link", { name: "Back to top" })).toBeVisible();

    const footerBottomHeight = await footer.locator(".footer-bottom").evaluate(
      (footerBottom) => footerBottom.getBoundingClientRect().height,
    );
    expect(footerBottomHeight).toBeGreaterThanOrEqual(72);
    expect(footerBottomHeight).toBeLessThanOrEqual(76);
  });

  test("keeps legal pages within the mobile viewport", async ({ page }) => {
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

      const widths = await page.locator(".legal-main").evaluate((main) => ({
        mainWidth: main.getBoundingClientRect().width,
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      }));
      expect(widths.mainWidth).toBe(widths.viewportWidth);
      expect(widths.documentWidth, JSON.stringify(widths)).toBe(widths.viewportWidth);
    }
  });

  test("keeps the mobile brand lockup visually prominent", async ({ page }) => {
    await page.goto("/");

    const brandMetrics = await page.locator(".brand-centered").evaluate((brand) => {
      const mark = brand.querySelector<HTMLElement>(".brand-mark");
      const wordmark = brand.querySelector<HTMLElement>("strong");
      if (!mark || !wordmark) throw new Error("The mobile brand lockup is incomplete");

      return {
        markWidth: mark.getBoundingClientRect().width,
        wordmarkHeight: wordmark.getBoundingClientRect().height,
      };
    });

    expect(brandMetrics.markWidth).toBeGreaterThanOrEqual(55);
    expect(brandMetrics.wordmarkHeight).toBeGreaterThanOrEqual(25);
  });
});
