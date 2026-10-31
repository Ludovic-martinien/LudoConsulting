CREATE TABLE "project_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_fr" varchar(240) NOT NULL,
	"title_en" varchar(240) DEFAULT '' NOT NULL,
	"project_slug" varchar(180),
	"file_name" varchar(240) NOT NULL,
	"mime_type" varchar(80) NOT NULL,
	"data_base64" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "project_documents_published_idx" ON "project_documents" USING btree ("is_published","display_order");