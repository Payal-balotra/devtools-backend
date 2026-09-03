import "dotenv/config";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPES_SECRET_KEY!);