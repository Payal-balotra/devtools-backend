import { type Request, type Response } from "express";
import { findUserByEmail } from "../services/user.services";
import { comparePassword } from "../lib/bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../lib/jwt";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("request arrived");
    if(!email || !password){
        return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const accessToken = generateAccessToken(user.id); 
    const refreshToken = generateRefreshToken(user.id);
    return res.status(200).json({ message: "Login successful", accessToken, refreshToken });

}  

export const refreshToken = (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  const userId = verifyRefreshToken(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid Refresh Token" });
  }
  const accessToken = generateAccessToken(userId);
  return res.status(200).json({ message: "Access Token", accessToken });
};