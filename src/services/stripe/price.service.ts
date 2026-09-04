import { stripe } from "../../lib/stripe";

interface CreatePriceInput {
  productId: string;
  amount: number;
  currency: string;
  interval?: "day" | "week" | "month" | "year";
}

export const createPrice = async ({
  productId,
  amount,
  currency,
  interval,
}: CreatePriceInput) => {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency,
    ...(interval && {
      recurring: {
        interval,
      },
    }),
  });

  return price;
};

export const getActivePrices = async () => {
  const prices = await stripe.prices.list({
    active: true,
    type: "recurring",
    expand: ["data.product"],
  });

  return prices.data;
};