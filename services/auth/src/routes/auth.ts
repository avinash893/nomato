import { Router } from "express";
import { loginUser, myProfile, addUserRole, demoLogin } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

router.post("/login", loginUser);
router.post("/demo", demoLogin);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);

export default router;
