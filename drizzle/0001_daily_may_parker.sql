CREATE TABLE "member_sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"email" varchar(254) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"password_hash" text,
	"google_id" varchar(120),
	"consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_users_email_unique" UNIQUE("email"),
	CONSTRAINT "member_users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
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
ALTER TABLE "member_sessions" ADD CONSTRAINT "member_sessions_user_id_member_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."member_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_sessions_user_idx" ON "member_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "member_users_email_idx" ON "member_users" USING btree ("email");