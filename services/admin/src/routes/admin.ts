import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth";
import {
  getPendingRestaurant,
  getPendingRiders,
  verifyRestaurant,
  verifyRider,
} from "../controllers/admin";

const router = express.Router();

router.get("/admin/restaurant/pending", isAuth, isAdmin, getPendingRestaurant);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);
router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
router.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);

export default router;
