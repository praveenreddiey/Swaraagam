import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swaraagam — Creative Therapeutic Practice",
    short_name: "Swaraagam",
    description:
      "Counselling, music and creative expression for reflection and wellbeing.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3eb",
    theme_color: "#24332d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
