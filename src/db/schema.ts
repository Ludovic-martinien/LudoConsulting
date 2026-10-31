import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 180 }).notNull(),
  professionalTitle: varchar("professional_title", { length: 240 }).notNull(),
  biographyFr: text("biography_fr").notNull().default(""),
  biographyEn: text("biography_en").notNull().default(""),
  sloganFr: varchar("slogan_fr", { length: 180 }).notNull().default("Innover – Développer – Réussir."),
  sloganEn: varchar("slogan_en", { length: 180 }).notNull().default("Innovate – Develop – Succeed."),
  email: varchar("email", { length: 254 }).notNull(),
  phonePrimary: varchar("phone_primary", { length: 40 }).notNull(),
  phoneSecondary: varchar("phone_secondary", { length: 40 }).notNull(),
  website: varchar("website", { length: 300 }).notNull(),
  whatsappCatalog: varchar("whatsapp_catalog", { length: 300 }).notNull(),
  logoUrl: text("logo_url"),
  profileImageUrl: text("profile_image_url"),
  ...timestamps(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  titleFr: varchar("title_fr", { length: 220 }).notNull(),
  titleEn: varchar("title_en", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  descriptionFr: text("description_fr").notNull(),
  descriptionEn: text("description_en").notNull(),
  icon: varchar("icon", { length: 80 }).notNull().default("sparkles"),
  coverImage: text("cover_image"),
  priceType: varchar("price_type", { length: 32 }).notNull().default("quote"),
  basePrice: integer("base_price"),
  currency: varchar("currency", { length: 12 }).notNull().default("FCFA"),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  ...timestamps(),
}, (table) => [index("services_published_order_idx").on(table.isPublished, table.displayOrder)]);

export const serviceItems = pgTable("service_items", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  titleFr: varchar("title_fr", { length: 240 }).notNull(),
  titleEn: varchar("title_en", { length: 240 }).notNull(),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => [index("service_items_service_order_idx").on(table.serviceId, table.displayOrder)]);

export const servicePrices = pgTable("service_prices", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  labelFr: varchar("label_fr", { length: 240 }).notNull(),
  labelEn: varchar("label_en", { length: 240 }).notNull(),
  price: integer("price").notNull(),
  priceType: varchar("price_type", { length: 32 }).notNull().default("starting"),
  currency: varchar("currency", { length: 12 }).notNull().default("FCFA"),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  ...timestamps(),
}, (table) => [index("service_prices_service_order_idx").on(table.serviceId, table.displayOrder)]);

export const servicePackages = pgTable("service_packages", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  nameFr: varchar("name_fr", { length: 180 }).notNull(),
  nameEn: varchar("name_en", { length: 180 }).notNull(),
  descriptionFr: text("description_fr").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  price: integer("price").notNull(),
  currency: varchar("currency", { length: 12 }).notNull().default("FCFA"),
  featuresFr: jsonb("features_fr").$type<string[]>().notNull().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().notNull().default([]),
  duration: varchar("duration", { length: 120 }),
  audienceFr: varchar("audience_fr", { length: 220 }),
  audienceEn: varchar("audience_en", { length: 220 }),
  conditionsFr: text("conditions_fr"),
  conditionsEn: text("conditions_en"),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  ...timestamps(),
}, (table) => [index("service_packages_service_order_idx").on(table.serviceId, table.displayOrder)]);

export const projectCategories = pgTable("project_categories", {
  id: serial("id").primaryKey(),
  nameFr: varchar("name_fr", { length: 180 }).notNull(),
  nameEn: varchar("name_en", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => projectCategories.id, { onDelete: "set null" }),
  titleFr: varchar("title_fr", { length: 220 }).notNull(),
  titleEn: varchar("title_en", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  shortDescriptionFr: text("short_description_fr").notNull(),
  shortDescriptionEn: text("short_description_en").notNull(),
  descriptionFr: text("description_fr").notNull(),
  descriptionEn: text("description_en").notNull(),
  objectives: jsonb("objectives").$type<{ fr: string; en: string }[]>().notNull().default([]),
  features: jsonb("features").$type<{ fr: string; en: string; state: "operational" | "in-development" | "planned" }[]>().notNull().default([]),
  status: varchar("status", { length: 40 }).notNull().default("to-confirm"),
  role: text("role").notNull().default(""),
  mainImageUrl: text("main_image_url"),
  demoUrl: text("demo_url"),
  repositoryUrl: text("repository_url"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  technologies: jsonb("technologies").$type<string[]>().notNull().default([]),
  isPublished: boolean("is_published").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps(),
}, (table) => [index("projects_published_order_idx").on(table.isPublished, table.displayOrder)]);

export const technologies = pgTable("technologies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  category: varchar("category", { length: 120 }),
});

export const projectTechnologies = pgTable("project_technologies", {
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  technologyId: integer("technology_id").notNull().references(() => technologies.id, { onDelete: "cascade" }),
}, (table) => [uniqueIndex("project_technology_pk").on(table.projectId, table.technologyId)]);

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  nameFr: varchar("name_fr", { length: 180 }).notNull(),
  nameEn: varchar("name_en", { length: 180 }).notNull(),
  categoryFr: varchar("category_fr", { length: 180 }).notNull(),
  categoryEn: varchar("category_en", { length: 180 }).notNull(),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  icon: varchar("icon", { length: 80 }),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  ...timestamps(),
});

export const articleCategories = pgTable("article_categories", {
  id: serial("id").primaryKey(),
  nameFr: varchar("name_fr", { length: 180 }).notNull(),
  nameEn: varchar("name_en", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => articleCategories.id, { onDelete: "set null" }),
  titleFr: varchar("title_fr", { length: 240 }).notNull(),
  titleEn: varchar("title_en", { length: 240 }).notNull().default(""),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  excerptFr: text("excerpt_fr").notNull().default(""),
  excerptEn: text("excerpt_en").notNull().default(""),
  contentFr: text("content_fr").notNull().default(""),
  contentEn: text("content_en").notNull().default(""),
  coverImageUrl: text("cover_image_url"),
  author: varchar("author", { length: 180 }).notNull().default("Ludo_Consulting"),
  seoTitleFr: varchar("seo_title_fr", { length: 240 }),
  seoTitleEn: varchar("seo_title_en", { length: 240 }),
  seoDescriptionFr: text("seo_description_fr"),
  seoDescriptionEn: text("seo_description_en"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [index("articles_published_idx").on(table.isPublished, table.publishedAt)]);

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 240 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 40 }).notNull().default("new"),
  consent: boolean("consent").notNull().default(false),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [index("contact_messages_status_created_idx").on(table.status, table.createdAt)]);

export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  referenceNumber: varchar("reference_number", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  company: varchar("company", { length: 220 }),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
  serviceSlug: varchar("service_slug", { length: 180 }),
  description: text("description").notNull(),
  budget: varchar("budget", { length: 120 }),
  desiredDeadline: varchar("desired_deadline", { length: 120 }),
  attachmentPath: text("attachment_path"),
  status: varchar("status", { length: 40 }).notNull().default("new"),
  internalNotes: text("internal_notes"),
  consent: boolean("consent").notNull().default(false),
  ...timestamps(),
}, (table) => [index("quote_requests_status_created_idx").on(table.status, table.createdAt)]);

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  packageId: integer("package_id").references(() => servicePackages.id, { onDelete: "set null" }),
  message: text("message"),
  status: varchar("status", { length: 40 }).notNull().default("new"),
  consent: boolean("consent").notNull().default(false),
  ...timestamps(),
});

export const uploadedImages = pgTable("uploaded_images", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 60 }).notNull().unique(),
  mimeType: varchar("mime_type", { length: 80 }).notNull(),
  dataBase64: text("data_base64").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  altFr: text("alt_fr"),
  altEn: text("alt_en"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 240 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  isPrivate: boolean("is_private").notNull().default(false),
  altFr: text("alt_fr"),
  altEn: text("alt_en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  url: text("url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 254 }).notNull().unique(),
  name: varchar("name", { length: 180 }),
  role: varchar("role", { length: 40 }).notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  adminEmail: varchar("admin_email", { length: 254 }).notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: varchar("entity_id", { length: 120 }),
  details: jsonb("details").$type<Record<string, string | number | boolean | null>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("activity_logs_created_idx").on(table.createdAt)]);

export const memberUsers = pgTable("member_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 254 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  passwordHash: text("password_hash"),
  googleId: varchar("google_id", { length: 120 }).unique(),
  consent: boolean("consent").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("member_users_email_idx").on(table.email)]);

export const memberSessions = pgTable("member_sessions", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => memberUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("member_sessions_user_idx").on(table.userId)]);

export const memberLoginEvents = pgTable("member_login_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => memberUsers.id, { onDelete: "cascade" }),
  method: varchar("method", { length: 20 }).notNull(),
  userAgent: varchar("user_agent", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("member_login_events_user_idx").on(table.userId, table.createdAt)]);

export const projectDocuments = pgTable("project_documents", {
  id: serial("id").primaryKey(),
  titleFr: varchar("title_fr", { length: 240 }).notNull(),
  titleEn: varchar("title_en", { length: 240 }).notNull().default(""),
  projectSlug: varchar("project_slug", { length: 180 }),
  fileName: varchar("file_name", { length: 240 }).notNull(),
  mimeType: varchar("mime_type", { length: 80 }).notNull(),
  dataBase64: text("data_base64").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("project_documents_published_idx").on(table.isPublished, table.displayOrder)]);

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  author: varchar("author", { length: 180 }).notNull(),
  role: varchar("role", { length: 180 }),
  contentFr: text("content_fr").notNull(),
  contentEn: text("content_en"),
  consentConfirmed: boolean("consent_confirmed").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
