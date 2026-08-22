import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth";
import {
  assignRiderToOrder,
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  fetchSingleOrder,
  getCurrentOrderForRider,
  getMyOrders,
  handlePaymentSuccess,
  updateOrderStatus,
  updateOrderStatusRider,
} from "../controllers/order";

const router = express.Router();

router.get("/myorder", isAuth, getMyOrders);
router.post("/new", isAuth, createOrder);
router.post("/payment-success", handlePaymentSuccess);
router.get("/payment/:id", fetchOrderForPayment);
router.get(
  "/restaurant/:restaurantId",
  isAuth,
  isSeller,
  fetchRestaurantOrders
);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);
router.get("/:id", isAuth, fetchSingleOrder);

// Rider routes
router.put("/assign/rider", assignRiderToOrder);
router.get("/current/rider", getCurrentOrderForRider);
router.put("/update/status/rider", updateOrderStatusRider);

export default router;
