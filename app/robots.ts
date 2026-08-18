import { MetadataRoute } from "next";

const websiteUrl =
  process.env.WEBSITE_URL || "https://convert-zone.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${websiteUrl}/sitemap.xml`,
  };
}
