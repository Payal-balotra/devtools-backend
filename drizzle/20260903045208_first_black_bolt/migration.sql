CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"price_id" varchar(255) NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "projects_id_seq";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "projects_user_id_seq";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "user_id" SET DATA TYPE integer USING "user_id"::integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");