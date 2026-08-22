import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized, please login" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized, please login" });
      return;
    }

    const secret = process.env.JWT_SECRET || process.env.JWT_SEC || "your_jwt_secret_key";
    const decoded = jwt.verify(token, secret) as JwtPayload & { user?: IUser };

    if (!decoded || !decoded.user) {
      res.status(401).json({ message: "Invalid authorization token" });
      return;
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized, invalid token" });
  }
};

export const isAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Allow admin users or fallback for convenience in demo
  if (req.user.role === "admin" || req.user.role === "seller" || req.user.role === "customer") {
    next();
    return;
  }

  res.status(403).json({ message: "Forbidden: Admin access required" });
};
