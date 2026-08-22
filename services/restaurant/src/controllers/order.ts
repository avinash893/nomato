import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import Address from "../models/Address";
import Cart from "../models/Cart";
import { IMenuItem } from "../models/MenuItems";
import Order from "../models/Order";
import Restaurant, { IRestaurant } from "../models/restaurant";
import { Response, Request } from "express";

export const createOrder = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized, please login first",
      });
    }

    const { paymentMethod = "razorpay", addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId: user._id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Selected delivery address not found",
      });
    }

    const getDistanceKm = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return +(R * c).toFixed(2);
    };

    const cartItems = await Cart.find({ userId: user._id })
      .populate<{ itemId: IMenuItem }>("itemId")
      .populate<{ restaurantId: IRestaurant }>("restaurantId");

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const firstCartItem = cartItems[0];

    if (!firstCartItem || !firstCartItem.restaurantId) {
      return res.status(400).json({
        message: "Invalid Cart data",
      });
    }

    const restaurantObj = firstCartItem.restaurantId as any;
    const restaurantId = restaurantObj._id;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    let distance = 2.5;
    if (
      address.location?.coordinates &&
      restaurant.autoLocation?.coordinates
    ) {
      distance = getDistanceKm(
        address.location.coordinates[1],
        address.location.coordinates[0],
        restaurant.autoLocation.coordinates[1],
        restaurant.autoLocation.coordinates[0]
      );
    }

    let subtotal = 0;

    const orderItems = cartItems.map((cart) => {
      const item = cart.itemId as any;
      if (!item) {
        throw new Error("Invalid cart item");
      }

      const itemTotal = item.price * cart.quauntity;
      subtotal += itemTotal;

      return {
        itemId: item._id.toString(),
        name: item.name,
        price: item.price,
        quauntity: cart.quauntity,
      };
    });

    const deliveryFee = subtotal < 250 ? 49 : 0;
    const platfromFee = 7;
    const totalAmount = subtotal + deliveryFee + platfromFee;

    const [longitude, latitude] = address.location?.coordinates || [77.209, 28.6139];
    const riderAmount = Math.max(40, Math.ceil(distance) * 17);

    const isCod = paymentMethod === "cod";
    const expiresAt = isCod ? undefined : new Date(Date.now() + 15 * 60 * 1000);

    const order = await Order.create({
      userId: user._id.toString(),
      restaurantId: restaurantId.toString(),
      restaurantName: restaurant.name,
      riderId: null,
      distance,
      riderAmount,
      items: orderItems,
      subtotal,
      deliveryFee,
      platfromFee,
      totalAmount,
      addressId: address._id.toString(),
      deliveryAddress: {
        fromattedAddress: address.formattedAddress,
        mobile: address.mobile,
        latitude,
        longitude,
      },
      paymentMethod,
      paymentStatus: isCod ? "paid" : "pending",
      status: "placed",
      expiresAt,
    });

    await Cart.deleteMany({ userId: user._id });

    // Notify realtime service if available
    try {
      const realtimeUrl = process.env.REALTIME_SERVICE || "http://127.0.0.1:5005";
      await axios.post(
        `${realtimeUrl}/api/v1/internal/emit`,
        {
          event: "order:new",
          room: `restaurant:${restaurant._id}`,
          payload: { orderId: order._id },
        },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY || "internal_secret_key",
          },
        }
      );
    } catch {
      // Non-blocking
    }

    return res.status(201).json({
      message: "Order created successfully",
      orderId: order._id.toString(),
      amount: totalAmount,
      order,
    });
  }
);

export const fetchOrderForPayment = TryCatch(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      orderId: order._id,
      amount: order.totalAmount,
      currency: "INR",
    });
  }
);

export const handlePaymentSuccess = TryCatch(
  async (req: Request, res: Response) => {
    const { orderId } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          paymentStatus: "paid",
          status: "placed",
        },
        $unset: {
          expiresAt: 1,
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    try {
      const realtimeUrl = process.env.REALTIME_SERVICE || "http://127.0.0.1:5005";
      await axios.post(
        `${realtimeUrl}/api/v1/internal/emit`,
        {
          event: "order:new",
          room: `restaurant:${order.restaurantId}`,
          payload: { orderId: order._id },
        },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY || "internal_secret_key",
          },
        }
      );
    } catch {
      // Non-blocking
    }

    return res.json({
      message: "Payment recorded successfully",
      order,
    });
  }
);

export const fetchRestaurantOrders = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const { restaurantId } = req.params;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({
      restaurantId,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  }
);

const ALLOWED_STATUSES = [
  "accepted",
  "preparing",
  "ready_for_rider",
  "picked_up",
  "delivered",
  "cancelled",
] as const;

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    try {
      const realtimeUrl = process.env.REALTIME_SERVICE || "http://127.0.0.1:5005";
      await axios.post(
        `${realtimeUrl}/api/v1/internal/emit`,
        {
          event: "order:update",
          room: `user:${order.userId}`,
          payload: {
            orderId: order._id,
            status: order.status,
          },
        },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY || "internal_secret_key",
          },
        }
      );
    } catch {
      // Non-blocking
    }

    return res.json({
      message: "Order status updated successfully",
      order,
    });
  }
);

export const getMyOrders = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({
      userId: req.user._id.toString(),
    }).sort({ createdAt: -1 });

    return res.json({ orders });
  }
);

export const fetchSingleOrder = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  }
);

export const assignRiderToOrder = TryCatch(
  async (req: Request, res: Response) => {
    const { orderId, riderId, riderName, riderPhone } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, riderId: null },
      {
        riderId,
        riderName,
        riderPhone,
        status: "rider_assigned",
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        message: "Order unavailable or already assigned to another rider",
      });
    }

    return res.json({
      message: "Rider assigned successfully",
      success: true,
      order,
    });
  }
);

export const getCurrentOrderForRider = TryCatch(
  async (req: Request, res: Response) => {
    const { riderId } = req.query;

    if (!riderId) {
      return res.status(400).json({ message: "Rider ID is required" });
    }

    const order = await Order.findOne({
      riderId: String(riderId),
      status: { $ne: "delivered" },
    });

    if (!order) {
      return res.status(404).json({ message: "No active delivery order found" });
    }

    return res.json(order);
  }
);

export const updateOrderStatusRider = TryCatch(
  async (req: Request, res: Response) => {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || (order.status === "rider_assigned" ? "picked_up" : "delivered");
    await order.save();

    return res.json({
      message: "Delivery status updated successfully",
      order,
    });
  }
);
