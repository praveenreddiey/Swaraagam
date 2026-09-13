import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** List every indexable public route with stable crawl priorities. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/service-information`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/accessibility`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
