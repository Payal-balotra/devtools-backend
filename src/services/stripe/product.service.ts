import { stripe } from "../../lib/stripe";

interface CreateProductInput {
  name: string;
  description?: string;
}

export const createProduct = async ({
  name,
  description,
}: CreateProductInput) => {
  const product = await stripe.products.create({
    name,
    description,
  });

  return product;
};