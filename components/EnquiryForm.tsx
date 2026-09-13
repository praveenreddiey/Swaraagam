"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAEZAEwEjHmvvbHbA";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          theme: "light";
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/** Render and submit the visitor enquiry form with Turnstile verification. */
export function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const submissionIdRef = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileContainerRef.current) return;

    const renderWidget = () => {
      if (
        !window.turnstile ||
        !turnstileContainerRef.current ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      turnstileWidgetIdRef.current = window.turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: TURNSTILE_SITE_KEY,
          action: "enquiry",
          theme: "light",
          callback: (token) => {
            setTurnstileToken(token);
            setFormError("");
          },
          "expired-callback": () => {
            setTurnstileToken("");
            setFormError(
              "The anti-spam check expired. Please complete it again.",
            );
          },
          "error-callback": () => {
            setTurnstileToken("");
            setFormError(
              "The anti-spam check could not load. Please refresh and try again.",
            );
          },
        },
      );
    };

    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (window.turnstile) {
      renderWidget();
    } else if (script) {
      script.addEventListener("load", renderWidget);
    } else {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget);
      document.head.appendChild(script);
    }

    return () => {
      script?.removeEventListener("load", renderWidget);
      if (window.turnstile && turnstileWidgetIdRef.current) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, []);

  function resetTurnstile() {
    if (window.turnstile && turnstileWidgetIdRef.current) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
    setTurnstileToken("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitted(false);
    setFormError("");

    if (!TURNSTILE_SITE_KEY) {
      setFormError(
        "Online appointment requests are temporarily unavailable. Please try again later.",
      );
      return;
    }
    if (!turnstileToken) {
      setFormError(
        "Please complete the anti-spam check before sending your request.",
      );
      return;
    }

    submissionIdRef.current ??= crypto.randomUUID();
    const formData = new FormData(form);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submissionIdRef.current,
          name: formData.get("name"),
          email: formData.get("email"),
          preferredDate: formData.get("preferredDate"),
          preferredTime: formData.get("preferredTime"),
          note: formData.get("note"),
          website: formData.get("website"),
          consent: formData.get("consent") === "yes",
          turnstileToken,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        safelyStored?: boolean;
      };

      if (!response.ok) {
        if (response.status === 409) submissionIdRef.current = null;
        throw new Error(
          result.error ??
            "Your appointment request could not be safely saved. Please try again.",
        );
      }
      if (!result.safelyStored) {
        throw new Error(
          "Your appointment request could not be confirmed as saved. Please try again.",
        );
      }

      form.reset();
      submissionIdRef.current = null;
      resetTurnstile();
      setSubmitted(true);
    } catch (error) {
      resetTurnstile();
      setFormError(
        error instanceof Error
          ? error.message
          : "Your appointment request could not be safely saved. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      data-reveal
      aria-busy={isSubmitting}
    >
      <div className="form-heading">
        <span>Request a session</span>
        <p>All fields marked * are required.</p>
      </div>

      <p className="crisis-form-note">
        <strong>Not a crisis service.</strong> For immediate support, contact
        your local emergency services or helpline.
      </p>

      <div className="form-honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="form-row">
        <div className="field-group">
          <label htmlFor="name">Your name *</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="How can I call you?"
            minLength={2}
            maxLength={80}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="email">Email address *</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            maxLength={254}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="field-group">
          <label htmlFor="preferredDate">Preferred date *</label>
          <input id="preferredDate" name="preferredDate" type="date" required />
        </div>
        <div className="field-group">
          <label htmlFor="preferredTime">Preferred time (IST) *</label>
          <div className="select-wrap">
            <select id="preferredTime" name="preferredTime" defaultValue="" required>
              <option value="" disabled>
                Choose a time window
              </option>
              <option value="Morning (9 am–12 pm)">Morning (9 am–12 pm)</option>
              <option value="Afternoon (12–4 pm)">Afternoon (12–4 pm)</option>
              <option value="Evening (4–7 pm)">Evening (4–7 pm)</option>
              <option value="Flexible">Flexible</option>
            </select>
            <span aria-hidden="true">⌄</span>
          </div>
        </div>
      </div>

      <details className="optional-note">
        <summary>Add a brief note <span>(optional)</span></summary>
        <div className="field-group">
          <label htmlFor="note">Anything you would like us to know?</label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={600}
            aria-describedby="note-guidance"
            placeholder="Share only what feels useful before we arrange the session."
          />
          <p id="note-guidance" className="field-guidance">
            Please do not include urgent, highly sensitive or detailed clinical
            information.
          </p>
        </div>
      </details>

      <label className="consent-field">
        <input name="consent" type="checkbox" value="yes" required />
        <span>
          I have read the <Link href="/privacy">Privacy Notice</Link> and agree that
          Swaraagam may use these details to respond to my appointment request. *
        </span>
      </label>

      <div
        className="turnstile-container"
        ref={turnstileContainerRef}
        aria-label="Anti-spam verification"
      />
      {!TURNSTILE_SITE_KEY && (
        <p className="configuration-message" role="status">
          Online appointment requests are temporarily unavailable while secure
          delivery is being configured.
        </p>
      )}

      <button
        className="button submit-button"
        type="submit"
        disabled={isSubmitting || !TURNSTILE_SITE_KEY}
      >
        {isSubmitting ? "Saving securely…" : "Request a session"}
        <span aria-hidden="true">→</span>
      </button>
      <p className="privacy-note">
        This form is not monitored as a crisis service. Your request is saved
        securely before the practice is notified and is retained for up to six
        months if you do not proceed.
      </p>

      <div className="form-status" aria-live="polite" aria-atomic="true">
        {formError && (
          <div className="form-error" role="alert">
            {formError}
          </div>
        )}
        {submitted && (
          <div className="success-message" role="status">
            <span aria-hidden="true">✓</span>
            Thank you. Your appointment request has been safely received.
            I&apos;ll respond within two working days. Your preferred time is
            confirmed only after you receive a reply from Swaraagam.
          </div>
        )}
      </div>
    </form>
  );
}
