import { Request, Response, NextFunction } from "express";
import { findUserById } from "../services/user.services";
import { verifyJwtToken } from "../lib/jwt";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Access denied",
    });
  }

  try {
    const decoded = verifyJwtToken(token);

    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};