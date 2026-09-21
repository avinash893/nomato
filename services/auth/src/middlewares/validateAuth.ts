import type { Request, Response, NextFunction } from "express";

/**
 * Validates role strings to prevent privilege escalation
 */
const ALLOWED_ROLES = new Set(["customer", "rider", "seller", "admin"]);

export function validateRoleInput(req: Request, res: Response, next: NextFunction): void {
  const { role } = req.body;
  if (!role || typeof role !== "string" || !ALLOWED_ROLES.has(role)) {
    res.status(400).json({
      success: false,
      message: "Invalid or unsupported role specification",
    });
    return;
  }
  next();
}
