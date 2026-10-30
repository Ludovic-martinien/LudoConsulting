CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_email" varchar(254) NOT NULL,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(100),
	"entity_id" varchar(120),
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(254) NOT NULL,
	"role" varchar(40) DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "article_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_fr" varchar(180) NOT NULL,
	"name_en" varchar(180) NOT NULL,
	"slug" varchar(180) NOT NULL,
	CONSTRAINT "article_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"title_fr" varchar(240) NOT NULL,
	"title_en" varchar(240) DEFAULT '' NOT NULL,
	"slug" varchar(200) NOT NULL,
	"excerpt_fr" text DEFAULT '' NOT NULL,
	"excerpt_en" text DEFAULT '' NOT NULL,
	"content_fr" text DEFAULT '' NOT NULL,
	"content_en" text DEFAULT '' NOT NULL,
	"cover_image_url" text,
	"author" varchar(180) DEFAULT 'Ludo_Consulting' NOT NULL,
	"seo_title_fr" varchar(240),
	"seo_title_en" varchar(240),
	"seo_description_fr" text,
	"seo_description_en" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(50),
	"subject" varchar(240) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(40) DEFAULT 'new' NOT NULL,
	"consent" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(240) NOT NULL,
	"url" text NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"size_bytes" integer NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"alt_fr" text,
	"alt_en" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(180) NOT NULL,
	"professional_title" varchar(240) NOT NULL,
	"biography_fr" text DEFAULT '' NOT NULL,
	"biography_en" text DEFAULT '' NOT NULL,
	"slogan_fr" varchar(180) DEFAULT 'Innover – Développer – Réussir.' NOT NULL,
	"slogan_en" varchar(180) DEFAULT 'Innovate – Develop – Succeed.' NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone_primary" varchar(40) NOT NULL,
	"phone_secondary" varchar(40) NOT NULL,
	"website" varchar(300) NOT NULL,
	"whatsapp_catalog" varchar(300) NOT NULL,
	"logo_url" text,
	"profile_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_fr" varchar(180) NOT NULL,
	"name_en" varchar(180) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"project_id" integer NOT NULL,
	"technology_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"title_fr" varchar(220) NOT NULL,
	"title_en" varchar(220) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"short_description_fr" text NOT NULL,
	"short_description_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(40) DEFAULT 'to-confirm' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"main_image_url" text,
	"demo_url" text,
	"repository_url" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_number" varchar(40) NOT NULL,
	"name" varchar(180) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"company" varchar(220),
	"service_id" integer,
	"service_slug" varchar(180),
	"description" text NOT NULL,
	"budget" varchar(120),
	"desired_deadline" varchar(120),
	"attachment_path" text,
	"status" varchar(40) DEFAULT 'new' NOT NULL,
	"internal_notes" text,
	"consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quote_requests_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(50),
	"package_id" integer,
	"message" text,
	"status" varchar(40) DEFAULT 'new' NOT NULL,
	"consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"title_fr" varchar(240) NOT NULL,
	"title_en" varchar(240) NOT NULL,
	"description_fr" text,
	"description_en" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"name_fr" varchar(180) NOT NULL,
	"name_en" varchar(180) NOT NULL,
	"description_fr" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"currency" varchar(12) DEFAULT 'FCFA' NOT NULL,
	"features_fr" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features_en" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"duration" varchar(120),
	"audience_fr" varchar(220),
	"audience_en" varchar(220),
	"conditions_fr" text,
	"conditions_en" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"label_fr" varchar(240) NOT NULL,
	"label_en" varchar(240) NOT NULL,
	"price" integer NOT NULL,
	"price_type" varchar(32) DEFAULT 'starting' NOT NULL,
	"currency" varchar(12) DEFAULT 'FCFA' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_fr" varchar(220) NOT NULL,
	"title_en" varchar(220) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"icon" varchar(80) DEFAULT 'sparkles' NOT NULL,
	"cover_image" text,
	"price_type" varchar(32) DEFAULT 'quote' NOT NULL,
	"base_price" integer,
	"currency" varchar(12) DEFAULT 'FCFA' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(120) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_fr" varchar(180) NOT NULL,
	"name_en" varchar(180) NOT NULL,
	"category_fr" varchar(180) NOT NULL,
	"category_en" varchar(180) NOT NULL,
	"description_fr" text,
	"description_en" text,
	"icon" varchar(80),
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" varchar(80) NOT NULL,
	"label" varchar(120) NOT NULL,
	"url" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"category" varchar(120),
	CONSTRAINT "technologies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"author" varchar(180) NOT NULL,
	"role" varchar(180),
	"content_fr" text NOT NULL,
	"content_en" text,
	"consent_confirmed" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_package_id_service_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."service_packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_items" ADD CONSTRAINT "service_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_created_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "articles" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE INDEX "contact_messages_status_created_idx" ON "contact_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "project_technology_pk" ON "project_technologies" USING btree ("project_id","technology_id");--> statement-breakpoint
CREATE INDEX "projects_published_order_idx" ON "projects" USING btree ("is_published","display_order");--> statement-breakpoint
CREATE INDEX "quote_requests_status_created_idx" ON "quote_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "service_items_service_order_idx" ON "service_items" USING btree ("service_id","display_order");--> statement-breakpoint
CREATE INDEX "service_packages_service_order_idx" ON "service_packages" USING btree ("service_id","display_order");--> statement-breakpoint
CREATE INDEX "service_prices_service_order_idx" ON "service_prices" USING btree ("service_id","display_order");--> statement-breakpoint
CREATE INDEX "services_published_order_idx" ON "services" USING btree ("is_published","display_order");
