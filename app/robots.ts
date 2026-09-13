import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private surfaces stay out of search results.
      disallow: ["/dashboard", "/style/", "/history", "/routine", "/settings", "/billing", "/admin", "/start/", "/card/", "/api/"],
    },
    sitemap: `https://${brand.domain}/sitemap.xml`,
  };
}
