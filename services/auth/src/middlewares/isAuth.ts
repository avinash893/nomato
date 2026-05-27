import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../models/User.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized login first" });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized login first" });
      return;
    }
    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload & { user?: IUser };

    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({ message: "invalid token" });
      return;
    }

    req.user = decodedValue.user;
    next();
  } catch (err) {
    console.log("JWT error:", err);
    res.status(401).json({ message: "Unauthorized  jwt error" });
  }
};
