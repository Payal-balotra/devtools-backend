  import { type Request, type Response } from "express";
  import { createUser, findUserByEmail, findUserById } from "../services/user.services";
  import { comparePassword, hashPassword } from "../lib/bcrypt";
  import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../lib/jwt";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("request arrived");
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  
  const accessToken = generateAccessToken(user.id);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false, 
    sameSite: "lax",
    maxAge: 2 * 60 * 1000,
  });
  const refreshToken = generateRefreshToken(user.id);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, 
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({ message: "Login successful", user: { id: user.id, email: user.email } });

}

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

    if(!name || !email || !password){
        return res.status(400).json({ message: "Name, email and password are required" });
    }
    const hashedPassword = await hashPassword(password);
    const user = await createUser(name, email, hashedPassword);
    if(!user){
        return res.status(500).json({ message: "User could not be created" });
    }

    const accessToken = generateAccessToken(user.id);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 1000,
    });
    const refreshToken = generateRefreshToken(user.id);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ message: "User created successfully", user: { id: user.id, email: user.email } });


  }
export const refreshToken = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      message: "Refresh token is required",
    });
  }

  try {
    const userId = verifyRefreshToken(token);

    const accessToken = generateAccessToken(userId);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Access token refreshed",
    });
  } catch {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};


export const getUserInfo = async (req: Request, res: Response) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Access token is required",
    });
  }

  const userId = verifyAccessToken(token); 
  if (!userId) {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }

  const user = await findUserById(Number(userId));
  if (!user) {  
    return res.status(404).json({
      message: "User not found",
    });
  }


  return res.status(200).json({
    message: "User info retrieved successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};


export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({ message: "Logged out successfully" });
}