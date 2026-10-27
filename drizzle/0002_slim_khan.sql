CREATE TABLE "member_login_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"method" varchar(20) NOT NULL,
	"user_agent" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_login_events" ADD CONSTRAINT "member_login_events_user_id_member_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."member_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_login_events_user_idx" ON "member_login_events" USING btree ("user_id","created_at");