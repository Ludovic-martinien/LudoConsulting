import type { MetadataRoute } from "next";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, projects, services } from "@/db/schema";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ludoconsulting.vercel.app";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureSeedData();
  const [serviceRows, projectRows, articleRows] = await Promise.all([
    db.select({ slug: services.slug, updatedAt: services.updatedAt }).from(services).where(eq(services.isPublished, true)).orderBy(asc(services.displayOrder)),
    db.select({ slug: projects.slug, updatedAt: projects.updatedAt }).from(projects).where(eq(projects.isPublished, true)).orderBy(asc(projects.displayOrder)),
    db.select({ slug: articles.slug, updatedAt: articles.updatedAt }).from(articles).where(eq(articles.isPublished, true)),
  ]);
  const staticPaths = ["", "/about", "/services", "/pricing", "/portfolio", "/skills", "/training", "/blog", "/quote", "/contact", "/privacy", "/legal", "/terms"];
  return [
    ...staticPaths.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.7 })),
    ...serviceRows.map((service) => ({ url: `${baseUrl}/services/${service.slug}`, lastModified: service.updatedAt, changeFrequency: "monthly" as const, priority: 0.65 })),
    ...projectRows.map((project) => ({ url: `${baseUrl}/portfolio/${project.slug}`, lastModified: project.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...articleRows.map((article) => ({ url: `${baseUrl}/blog/${article.slug}`, lastModified: article.updatedAt, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
