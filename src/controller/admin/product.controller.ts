import { Request, Response } from "express";
import { createProduct } from "../../services/stripe/product.service";

export const createProductController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    const product = await createProduct({
      name,
      description,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};