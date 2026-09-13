import type { Metadata } from "next";
import {
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const title =
  "Swaraagam | Counselling, Arts-Based & Music-Informed Support";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      email: CONTACT_EMAIL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      founder: { "@id": `${SITE_URL}/#pragati-bhatt` },
      areaServed: [
        { "@type": "City", name: "Mumbai" },
        { "@type": "Country", name: "India" },
      ],
      knowsLanguage: ["English", "Hindi", "Gujarati"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Swaraagam therapeutic services",
        itemListElement: [
          "Counselling",
          "Arts-Based Therapy",
          "Music-Informed Support",
        ].map((name) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name,
            provider: { "@id": `${SITE_URL}/#organization` },
            areaServed: { "@type": "Country", name: "India" },
          },
        })),
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#pragati-bhatt`,
      name: "Pragati Bhatt",
      jobTitle:
        "Counselling Psychologist, Arts-Based Therapy Practitioner and Music Therapy Intern",
      worksFor: { "@id": `${SITE_URL}/#organization` },
      knowsLanguage: ["English", "Hindi", "Gujarati"],
    },
  ],
};

/** Define site-wide search, social, icon, and crawler metadata. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | Swaraagam",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  keywords: [
    "counselling Mumbai",
    "online counselling India",
    "arts-based therapy",
    "music therapy",
    "creative therapeutic practice",
    "mental wellbeing",
  ],
  authors: [{ name: "Swaraagam" }],
  creator: "Swaraagam",
  publisher: "Swaraagam",
  icons: {
    icon: [
      {
        url: "/favicon.ico?v=2",
        type: "image/x-icon",
        sizes: "16x16 32x32 48x48 64x64",
      },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-192.png", type: "image/png", sizes: "192x192" }],
  },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Swaraagam — Creative Therapeutic Practice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/** Render the shared document shell, metadata and organization schema. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
