import express from "express";
import {
  addRestaurant,
  fetchMyRestaurant,
  fetchSingleRestaurant,
  getNearbyRestaurant,
  updateRestaurant,
  updateStatusRestaurant,
} from "../controllers/restaurant";
import { isAuth, isSeller } from "../middlewares/isAuth";
import uploadFile from "../middlewares/multer";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestaurant);
router.get("/my", isAuth, isSeller, fetchMyRestaurant);
router.put("/status", isAuth, isSeller, updateStatusRestaurant);
router.put("/edit", isAuth, isSeller, updateRestaurant);
router.get("/all", getNearbyRestaurant);
router.get("/:id", fetchSingleRestaurant);

export default router;
