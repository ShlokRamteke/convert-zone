import { MetadataRoute } from "next";
const websiteUrl =
  process.env.WEBSITE_URL || "https://www.mediaconverterpro.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: websiteUrl,
      lastModified: new Date().toISOString(),
      priority: 1.0,
    },
    {
      url: `${websiteUrl}/video`,
      lastModified: new Date().toISOString(),
      priority: 0.8,
    },
    {
      url: `${websiteUrl}/image`,
      lastModified: new Date().toISOString(),
      priority: 0.8,
    },
  ];
}
