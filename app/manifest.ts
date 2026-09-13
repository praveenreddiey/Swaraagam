import type { MetadataRoute } from "next";

/** Publish install metadata using the current Swaraagam palette. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swaraagam — Creative Therapeutic Practice",
    short_name: "Swaraagam",
    description:
      "Counselling, music and creative expression for reflection and wellbeing.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7e8",
    theme_color: "#352e49",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
