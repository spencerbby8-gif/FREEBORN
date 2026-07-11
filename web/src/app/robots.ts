import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/auth/callback", "/auth/complete", "/auth/signout"],
      },
    ],
    sitemap: "https://freeborn.app/sitemap.xml",
    host: "https://freeborn.app",
  };
}
