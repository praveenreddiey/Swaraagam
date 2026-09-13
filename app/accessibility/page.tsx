import type { Metadata } from "next";
import { CopyEmailAddress } from "@/components/CopyEmailAddress";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Swaraagam's commitment to providing an accessible and inclusive website experience.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility Statement"
      summary="Swaraagam aims to make this website calm, understandable and usable by as many people as possible."
      updated="23 August 2026"
    >
      <section>
        <h2>Our approach</h2>
        <p>
          The website is designed with the Web Content Accessibility Guidelines
          (WCAG) 2.2 Level AA as its target. Accessibility is an ongoing process,
          and the site is reviewed as its content and services change.
        </p>
      </section>

      <section>
        <h2>Accessibility measures</h2>
        <ul>
          <li>clear heading structure and descriptive page titles;</li>
          <li>keyboard-accessible navigation, links and form controls;</li>
          <li>a skip link and visible keyboard focus;</li>
          <li>labelled form fields and announced error or success messages;</li>
          <li>readable text, responsive layouts and support for browser zoom;</li>
          <li>reduced motion when requested by the operating system; and</li>
          <li>content that remains available when optional animation is absent.</li>
        </ul>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          The appointment-request form uses Cloudflare Turnstile for spam
          protection. This service is operated by a third party and may have
          accessibility limitations outside Swaraagam&apos;s direct control. If it
          prevents you from making a request, please contact the practice by
          email.
        </p>
      </section>

      <section>
        <h2>Requesting support or an alternative format</h2>
        <p>
          If you find a barrier, need information in another format or require
          assistance making an enquiry, write to{" "}
          <CopyEmailAddress email={CONTACT_EMAIL} />. Please include
          the page or task that caused difficulty and the format or adjustment
          that would help. A response is normally provided within two working
          days.
        </p>
      </section>

      <section>
        <h2>Emergency access</h2>
        <p>
          Accessibility feedback channels are not monitored for emergencies.
          In an immediate emergency in India, call{" "}
          <a href="tel:112">112</a> or visit the nearest hospital emergency
          department.
        </p>
      </section>
    </LegalPage>
  );
}
