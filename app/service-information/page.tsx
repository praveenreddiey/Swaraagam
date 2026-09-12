import type { Metadata } from "next";
import { CopyEmailAddress } from "@/components/CopyEmailAddress";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, PRACTICE_LOCATION } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service Information",
  description:
    "Practical information about Swaraagam sessions, fees, cancellations, confidentiality, online services and support for minors.",
  alternates: { canonical: "/service-information" },
};

export default function ServiceInformationPage() {
  return (
    <LegalPage
      eyebrow="Before we begin"
      title="Service Information"
      summary="Clear practical information to help you decide whether Swaraagam may be a suitable place to begin."
      updated="23 August 2026"
    >
      <section>
        <h2>About Swaraagam</h2>
        <p>
          Swaraagam is a creative therapeutic practice based in{" "}
          {PRACTICE_LOCATION}. Counselling, music and creative expression may be
          used separately or together in response to each person&apos;s needs and
          comfort.
        </p>
      </section>

      <section>
        <h2>Practitioner qualifications and training</h2>
        <p>
          Pragati Bhatt holds an MA in Counselling Psychology and a Visharad in
          Indian Classical Vocal Music (BA-Music). She is a trained Arts-Based
          Therapy Practitioner and is currently undertaking an internship in
          Music Therapy.
        </p>
      </section>

      <section>
        <h2>Who the service supports</h2>
        <p>
          Services are available for children, including early-intervention and
          school-age clients, adolescents and adults. Suitability is considered
          during the initial consultation. When a person&apos;s needs fall outside
          the scope of the practice, an appropriate referral may be suggested.
        </p>
      </section>

      <section>
        <h2>Children and clients under 18</h2>
        <p>
          Services for clients under 18 require informed consent from a parent
          or legal guardian. Parent or guardian involvement is included where
          appropriate to the client&apos;s age, needs and the nature of the service.
          The young person&apos;s privacy, safeguarding arrangements and the limits
          of confidentiality are discussed before sessions begin.
        </p>
      </section>

      <section>
        <h2>Online and in-person availability</h2>
        <p>
          Online sessions are available across India. The client must be
          physically located in India during an online session and should join
          from a private, safe location with a stable connection. In-person
          sessions may be available in Mumbai, subject to location and
          appointment availability.
        </p>
      </section>

      <section>
        <h2>Session length and fees</h2>
        <p>
          Individual sessions generally last 45–60 minutes. The initial
          consultation is a paid appointment. Fees vary according to the
          service and session type and are confirmed before an appointment is
          booked. A limited number of concessional and pro bono slots may be
          available, subject to availability.
        </p>
      </section>

      <section>
        <h2>Cancellation and rescheduling</h2>
        <p>
          An appointment may be rescheduled without an additional charge when
          at least 24 hours&apos; notice is provided. A cancellation or rescheduling
          request made less than 24 hours before the session may be chargeable,
          except in a genuine emergency. Any applicable charge is explained
          before services begin.
        </p>
      </section>

      <section>
        <h2>Confidentiality</h2>
        <p>
          Personal information and session content are treated as confidential.
          Confidentiality may be limited where disclosure is required by law,
          where there is a serious and immediate concern about someone&apos;s
          safety, or where safeguarding obligations apply. Professional
          supervision may involve anonymised discussion intended to support the
          quality and safety of the work. These limits are explained during the
          consent process.
        </p>
      </section>

      <section>
        <h2>What the appointment-request form does</h2>
        <p>
          Submitting a request does not create a therapeutic relationship and
          does not confirm an appointment. Preferred dates and times are used to
          understand availability; an appointment is confirmed only after
          Swaraagam replies. Please share only a brief note and avoid detailed
          clinical or urgent safety information.
        </p>
      </section>

      <section>
        <h2>Emergency and crisis support</h2>
        <p>
          Swaraagam does not provide emergency or crisis-intervention services,
          and the enquiry form and mailbox are not continuously monitored. If
          you or someone else is in immediate danger in India, call{" "}
          <a href="tel:112">112</a> or go to the nearest hospital emergency
          department. For tele-mental-health support, contact Tele-MANAS at{" "}
          <a href="tel:14416">14416</a> or{" "}
          <a href="tel:18008914416">1800-89-14416</a>.
        </p>
      </section>

      <section>
        <h2>Questions or concerns</h2>
        <p>
          For a service question, privacy request, accessibility issue or
          grievance, write to{" "}
          <CopyEmailAddress email={CONTACT_EMAIL} />. Enquiries are
          generally answered within two working days; this timeframe does not
          apply to emergencies.
        </p>
      </section>
    </LegalPage>
  );
}
