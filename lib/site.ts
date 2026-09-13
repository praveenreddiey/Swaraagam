/** Shared public-site identity, contact and retention configuration. */
export const SITE_NAME = "Swaraagam";
export const SITE_DESCRIPTION =
  "A gentle, collaborative therapeutic practice offering counselling, arts-based therapy and music-informed support online across India and in person in Mumbai.";

// Canonical public origin used for metadata, robots.txt, and the sitemap.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://swaraagam.com";

export const CONTACT_EMAIL = "enquiries@swaraagam.com";
export const PRACTICE_LOCATION = "Mumbai, Maharashtra, India";
export const ENQUIRY_RETENTION_MONTHS = 6;
