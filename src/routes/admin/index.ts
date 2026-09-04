import Router from 'express';
import productsRoutes from "../admin/product.routes"
import pricesRoutes from "../admin/price.routes"
import subscriptionRoutes from "../admin/subscription.routes"
import paymentRoutes from "../admin/payment.routes"
import { stripe } from '../../lib/stripe';

const router = Router();

router.use('/products', productsRoutes)
router.use('/prices', pricesRoutes);
router.use('/subscriptions', subscriptionRoutes)
router.use('/payments', paymentRoutes)

router.post("/coupons", async (req, res) => {
  try {
    const { percentOff, amountOff, currency, duration, code } = req.body as {
      percentOff?: number;
      amountOff?: number;
      currency?: string;
      duration?: "once" | "forever" | "repeating";
      code?: string;
    };

    if (!percentOff && !amountOff) {
      return res
        .status(400)
        .json({ message: "percentOff or amountOff is required" });
    }
    if (percentOff && (percentOff < 1 || percentOff > 100)) {
      return res
        .status(400)
        .json({ message: "percentOff must be between 1 and 100" });
    }
    if (!code) {
      return res.status(400).json({ message: "code is required" });
    }

    const coupon = await stripe.coupons.create({
      percent_off: percentOff,
      amount_off: amountOff,
      currency: amountOff ? currency ?? "usd" : undefined,
      duration: duration ?? "once",
    });

    const promotionCode = await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      code,
    });

    return res.json({ coupon, promotionCode });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    return res.status(500).json({ message: "Failed to create coupon" });
  }
});

export default router;
