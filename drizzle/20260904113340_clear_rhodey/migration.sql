CREATE TABLE "payments" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_payment_intent_id" varchar(255) NOT NULL UNIQUE,
	"amount" integer NOT NULL,
	"amount_refunded" integer DEFAULT 0 NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"status" varchar(50) NOT NULL,
	"description" varchar(500),
	"stripe_invoice_id" varchar(255),
	"receipt_url" varchar(500),
	"failure_message" varchar(500),
	"stripe_coupon_id" varchar(255),
	"promotion_code" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "refunds" (
	"id" serial PRIMARY KEY,
	"payment_id" integer NOT NULL,
	"stripe_refund_id" varchar(255) NOT NULL UNIQUE,
	"amount" integer NOT NULL,
	"reason" varchar(50),
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id");