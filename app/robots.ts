import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Allow public pages while keeping the enquiry API out of crawler paths. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
