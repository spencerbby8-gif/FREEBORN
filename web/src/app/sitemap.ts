import type { MetadataRoute } from "next";

const lastModified = new Date("2026-07-11T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://freeborn.app",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
