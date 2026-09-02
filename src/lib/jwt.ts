import { config } from "dotenv";
import "dotenv/config";
import Jwt, { JwtPayload } from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error("SECRET_KEY is not defined");
}

export const generateAccessToken = (userId: number) => {
  return Jwt.sign(
    { userId },
    secretKey,
    {
      expiresIn: "1h",
    }
  );
};


export const generateRefreshToken = (userId: number) => {
  return Jwt.sign(
    { userId },

    secretKey,
    {
      expiresIn: "7d",
    }
  );
}

export const verifyAccessToken = (token: string) => {
  try {
    const decoded = Jwt.verify(token, secretKey) as { userId: number };
    return decoded.userId;
    } catch (error) {
    throw new Error("Invalid or expired token");
    }
}

export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = Jwt.verify(token, secretKey) as { userId: number };
    return decoded.userId;
    } catch (error) {
    throw new Error("Invalid or expired token");
    }
}
export const verifyJwtToken = (token: string) => {
  const decoded = Jwt.verify(token, secretKey) as JwtPayload;
  return decoded;
} 