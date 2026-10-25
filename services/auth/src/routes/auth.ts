import { Router } from "express";
import { loginUser, myProfile, addUserRole, demoLogin } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/login", authRateLimiter, loginUser);
router.post("/demo", authRateLimiter, demoLogin);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);

export default router;
