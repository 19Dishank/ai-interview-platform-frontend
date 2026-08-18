import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://verquo.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/continue"],
      disallow: ["/candidate/", "/recruiter/", "/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
