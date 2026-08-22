import express from "express";
import { isAuth } from "../middlewares/isAuth";
import {
  acceptOrder,
  addRiderProfile,
  broadcastOrderToRiders,
  fetchMyCurrentOrder,
  fetchMyProfile,
  getAvailablePendingOrders,
  toggleRiderAvailablity,
  updateOrderStatus,
} from "../controllers/rider";
import uploadFile from "../middlewares/multer";

const router = express.Router();

router.post("/new", isAuth, uploadFile, addRiderProfile);
router.get("/myprofile", isAuth, fetchMyProfile);
router.patch("/toggle", isAuth, toggleRiderAvailablity);
router.post("/accept/:orderId", isAuth, acceptOrder);
router.get("/order/current", isAuth, fetchMyCurrentOrder);
router.get("/order/pending", isAuth, getAvailablePendingOrders);
router.post("/broadcast-order", broadcastOrderToRiders);
router.put("/order/update/:orderId", isAuth, updateOrderStatus);

export default router;
