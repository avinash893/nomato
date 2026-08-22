import express from "express";
import { addRestaurant, fetchMyRestaurant } from "../controllers/restaurant";
import { isAuth, isSeller } from "../middlewares/isAuth";
import uploadFile from "../middlewares/multer";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestaurant);
router.get("/my", isAuth, isSeller, fetchMyRestaurant);

export default router;
