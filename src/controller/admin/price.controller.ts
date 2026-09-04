import { Request, Response } from "express";
import { createPrice, getActivePrices } from "../../services/stripe/price.service";

export const createPriceController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      productId,
      amount,
      currency,
      interval,
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    if (!currency) {
      return res.status(400).json({
        message: "Currency is required",
      });
    }

    const price = await createPrice({
      productId,
      amount,
      currency,
      interval,
    });

    return res.status(201).json({
      message: "Price created successfully",
      price,
    });
  } catch (error) {
    console.error("Create price error:", error);

    return res.status(500).json({
      message: "Failed to create price",
    });
  }
};

export const adminGetPrices = async (
  req: Request,
  res: Response
) => {
  try {
    const prices = await getActivePrices();

    return res.status(200).json({
      prices,
    });
  } catch (error) {
    console.error("ADMIN GET PRICES ERROR:", error);

    return res.status(500).json({
      message: "Failed to get prices",
    });
  }
};