import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const BASE_URL = "https://roomscluster.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/contact`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/terms`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE_URL}/refund-policy`, priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const blogPosts = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...blogPosts];
}