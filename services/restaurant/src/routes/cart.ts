import express from "express";
import { isAuth } from "../middlewares/isAuth";
import {
  clearCart,
  addToCart,
  decrementCartItem,
  fetchMyCart,
  incrementCartItem,
} from "../controllers/cart";

const router = express.Router();

router.post("/add", isAuth, addToCart);
router.get("/all", isAuth, fetchMyCart);
router.put("/inc", isAuth, incrementCartItem);
router.put("/dec", isAuth, decrementCartItem);
router.delete("/clear", isAuth, clearCart);

export default router;
