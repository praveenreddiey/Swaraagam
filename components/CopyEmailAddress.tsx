"use client";

import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Some browsers expose the API but deny it. Use the local fallback below.
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    textArea.remove();
  }

  if (!copied) {
    throw new Error("The email address could not be copied.");
  }
}

export function CopyEmailAddress({ email }: { email: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function handleCopy() {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    try {
      await copyToClipboard(email);
      setState("copied");
    } catch {
      setState("failed");
    }

    resetTimer.current = setTimeout(() => setState("idle"), 2500);
  }

  const status =
    state === "copied"
      ? "Copied"
      : state === "failed"
        ? "Copy unavailable"
        : "";

  return (
    <span className="copy-email">
      <button
        className="copy-email-button"
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${email} to clipboard`}
        title="Copy email address"
      >
        {email}
      </button>
      <span className="copy-email-status" role="status" aria-live="polite">
        {status}
      </span>
    </span>
  );
}
