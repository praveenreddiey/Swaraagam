import type { Metadata } from "next";
import { CopyEmailAddress } from "@/components/CopyEmailAddress";
import { LegalPage } from "@/components/LegalPage";
import {
  CONTACT_EMAIL,
  ENQUIRY_RETENTION_MONTHS,
  PRACTICE_LOCATION,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How Swaraagam collects, uses, protects and retains personal information submitted through this website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Your information"
      title="Privacy Notice"
      summary="This notice explains what this website collects, why it is needed, how it is protected and the choices available to you."
      updated="23 August 2026"
    >
      <section>
        <h2>Who is responsible for your information</h2>
        <p>
          Swaraagam is a creative therapeutic practice operated by Pragati
          Bhatt and based in {PRACTICE_LOCATION}. For information submitted
          through this website, Swaraagam is responsible for deciding how and
          why that information is used.
        </p>
      </section>

      <section>
        <h2>Information collected through the appointment-request form</h2>
        <p>The form asks only for information needed to respond to you:</p>
        <ul>
          <li>your name and email address;</li>
          <li>one preferred appointment date and time window;</li>
          <li>an optional brief note;</li>
          <li>your consent to use these details to respond to the request; and</li>
          <li>
            limited technical anti-spam and security information. Raw IP
            addresses are not stored in the enquiry record.
          </li>
        </ul>
        <p>
          Please do not submit detailed clinical records, identification
          documents, payment-card information or urgent safety information
          through this form.
        </p>
      </section>

      <section>
        <h2>How the information is used</h2>
        <p>Information is used only to:</p>
        <ul>
          <li>respond to your enquiry and discuss possible next steps;</li>
          <li>arrange or reschedule an appointment;</li>
          <li>maintain a reliable record if an email notification fails;</li>
          <li>protect the form from spam, fraud and misuse; and</li>
          <li>meet applicable legal, safety and administrative obligations.</li>
        </ul>
        <p>
          Enquiry details are not sold and are not used for advertising or
          unrelated marketing.
        </p>
      </section>

      <section>
        <h2>Consent and withdrawal</h2>
        <p>
          The form asks for a clear confirmation before submission. You may
          withdraw that consent or ask for deletion by writing to{" "}
          <CopyEmailAddress email={CONTACT_EMAIL} />. Withdrawal
          does not affect processing already completed and may not apply to
          information that must be retained under law.
        </p>
      </section>

      <section>
        <h2>Storage and retention</h2>
        <p>
          A submitted enquiry is saved in the website&apos;s protected database
          before an email notification is attempted. This prevents a temporary
          email failure from losing your message. Enquiries that do not proceed
          to services are retained for no longer than{" "}
          {ENQUIRY_RETENTION_MONTHS} months from submission and are then
          deleted, unless a longer period is required for a legal or safety
          reason.
        </p>
        <p>
          If you become a client, appropriate administrative and service
          records are handled separately under the consent and record-keeping
          information provided before sessions begin.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>
          Swaraagam uses carefully selected providers to operate this website:
          Cloudflare Sites and D1 for hosting and secure request storage,
          Cloudflare Turnstile for anti-spam verification, and Resend for email
          notification. These providers process only the information needed to deliver
          their services and may process data in jurisdictions outside India
          under their applicable safeguards and privacy terms.
        </p>
      </section>

      <section>
        <h2>Children and adolescents</h2>
        <p>
          A parent or legal guardian should submit initial enquiries for a
          child. Services for clients under 18 are provided with appropriate
          parent or guardian consent and involvement. Further consent,
          confidentiality and safeguarding information is explained before
          services begin.
        </p>
      </section>

      <section>
        <h2>Your choices and requests</h2>
        <p>
          You may ask what information is held about you, request correction or
          deletion, withdraw consent, or raise a privacy grievance. Contact{" "}
          <CopyEmailAddress email={CONTACT_EMAIL} />. Please do not
          send sensitive clinical information in the request. Reasonable steps
          may be taken to verify your identity before information is disclosed
          or changed.
        </p>
      </section>

      <section>
        <h2>Emergency information</h2>
        <p>
          The website and enquiry mailbox are not monitored as crisis services.
          Do not use them for urgent help. In an immediate emergency in India,
          call <a href="tel:112">112</a> or visit the nearest hospital emergency
          department. Tele-MANAS is available at{" "}
          <a href="tel:14416">14416</a> or{" "}
          <a href="tel:18008914416">1800-89-14416</a>.
        </p>
      </section>
    </LegalPage>
  );
}
