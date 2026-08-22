import User from "../models/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";

export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "Authorization code is required" });
  }

  const googleResponse = await oauth2client.getToken(code);

  const userResponse = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`
  );

  const { email, name, picture } = userResponse.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
  }

  const secret = process.env.JWT_SECRET || process.env.JWT_SEC || "your_jwt_secret_key";
  const token = jwt.sign({ user: user }, secret, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    message: "Login successful",
    token,
    user,
  });
});

export const demoLogin = TryCatch(async (req, res) => {
  const { role = "customer", name, email } = req.body;
  const userEmail = email || `demo_${role}@nomato.com`;
  const userName =
    name ||
    (role === "seller"
      ? "Chef Luigi (Restaurant Partner)"
      : role === "rider"
      ? "Swift Rider (Delivery Partner)"
      : role === "admin"
      ? "Admin Officer"
      : "Avinash (Foodie Customer)");

  const userImage =
    role === "seller"
      ? "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80"
      : role === "rider"
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

  let user = await User.findOne({ email: userEmail });

  if (!user) {
    user = await User.create({
      name: userName,
      email: userEmail,
      image: userImage,
      role: role,
    });
  } else {
    user.role = role;
    await user.save();
  }

  const secret = process.env.JWT_SECRET || process.env.JWT_SEC || "your_jwt_secret_key";
  const token = jwt.sign({ user }, secret, {
    expiresIn: "7d",
  });

  return res.status(200).json({
    message: `Logged in as ${role.toUpperCase()}`,
    token,
    user,
  });
});

const allowedRoles = ["customer", "rider", "seller", "admin"] as const;

type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const secret = process.env.JWT_SECRET || process.env.JWT_SEC || "your_jwt_secret_key";
  const token = jwt.sign({ user }, secret, {
    expiresIn: "7d",
  });

  return res.json({ user, token });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  return res.json(user);
});
