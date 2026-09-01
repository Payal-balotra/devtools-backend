CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" serial
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");