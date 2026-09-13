import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${brand.domain}`;
  const now = new Date();
  return [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/how-it-works`, lastModified: now, priority: 0.8 },
    { url: `${base}/pricing`, lastModified: now, priority: 0.8 },
    { url: `${base}/signup`, lastModified: now, priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, priority: 0.3 },
  ];
}
