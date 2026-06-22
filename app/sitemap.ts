import type { MetadataRoute } from "next";

import { publicSeoRoutes } from "@/lib/content/public-pages";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicSeoRoutes.map((route) => ({
    url: absoluteUrl(route.pathname),
    changeFrequency: "monthly",
    priority: route.pathname === "/no" ? 1 : 0.8,
  }));
}
