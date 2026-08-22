import express from "express";
import { isAuth } from "../middlewares/isAuth";
import {
  addAddress,
  deleteAddress,
  getMyAddresses,
} from "../controllers/address";

const router = express.Router();

router.post("/new", isAuth, addAddress);
router.delete("/:id", isAuth, deleteAddress);
router.get("/all", isAuth, getMyAddresses);

export default router;
