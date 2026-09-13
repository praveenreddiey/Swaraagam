import { EnquiryForm } from "@/components/EnquiryForm";
import Link from "next/link";

/** Explain the booking journey and render the secure appointment request form. */
export function BookingSection() {
  return (
    <section
      id="booking"
      className="booking-section scroll-mt-20"
      aria-labelledby="booking-title"
    >
      <div className="page-shell booking-grid">
        <div className="booking-intro" data-reveal>
          <h2 id="booking-title" className="section-title">
            Let’s find a gentle way forward.
          </h2>
          <p>
            Share a few essential details and one preferred time. I’ll respond
            within two working days to discuss the right support, confirm
            availability and explain the next step.
          </p>

          <div
            className="booking-journey"
            aria-labelledby="booking-journey-title"
          >
            <h3 id="booking-journey-title">How booking works</h3>
            <ol>
              <li>
                <span aria-hidden="true">1</span>
                <p>
                  <strong>Send your request</strong>
                  Share the essential details and your preferred time.
                </p>
              </li>
              <li>
                <span aria-hidden="true">2</span>
                <p>
                  <strong>Receive a personal reply</strong>
                  Availability, fees and the next step are shared by email.
                </p>
              </li>
              <li>
                <span aria-hidden="true">3</span>
                <p>
                  <strong>Confirm the consultation</strong>
                  Your appointment is set only after Swaraagam confirms it.
                </p>
              </li>
            </ol>
          </div>

          <Link
            className="inline-detail-link directional-link booking-service-link"
            data-direction="right"
            href="/service-information"
          >
            View session formats, duration and fees
            <span className="link-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <EnquiryForm />
      </div>

      <div className="page-shell booking-closing" data-reveal>
        <p>Before you go…</p>
        <h3>Reaching out can feel like the hardest step.</h3>
        <span>Thank you for considering Swaraagam.</span>
      </div>
    </section>
  );
}
