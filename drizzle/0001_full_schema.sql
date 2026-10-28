CREATE TABLE "uploaded_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" varchar(60) NOT NULL,
	"mime_type" varchar(80) NOT NULL,
	"data_base64" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"alt_fr" text,
	"alt_en" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uploaded_images_kind_unique" UNIQUE("kind")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(30),
	"password_hash" text,
	"provider" varchar(20) DEFAULT 'email' NOT NULL,
	"google_id" varchar(120),
	"avatar_url" text,
	"token_version" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"terms_accepted_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "admin_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "actor_type" varchar(20) DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "actor_id" varchar(120);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "success" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "ip" varchar(64);--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "name" varchar(180);--> statement-breakpoint
ALTER TABLE "quote_requests" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;