import axios from "axios";
import getBuffer from "../config/datauri";
import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import { Rider } from "../model/Rider";
import { Request, Response } from "express";

export const addRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Rider ID/Profile photo is required" });
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
      return res.status(500).json({ message: "Failed to generate image buffer" });
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      }
    );

    const {
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      latitude,
      longitude,
    } = req.body;

    if (
      !phoneNumber ||
      !aadharNumber ||
      !drivingLicenseNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingProfile = await Rider.findOne({ userId: user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Rider profile already exists" });
    }

    const riderProfile = await Rider.create({
      userId: user._id,
      picture: uploadResult.url,
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
      isAvailble: false,
      isVerified: true,
    });

    return res.status(201).json({
      message: "Rider profile created successfully",
      riderProfile,
    });
  }
);

export const fetchMyProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const account = await Rider.findOne({ userId: user._id });
    return res.json(account);
  }
);

export const toggleRiderAvailablity = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { isAvailble, latitude, longitude } = req.body;

    if (typeof isAvailble !== "boolean") {
      return res.status(400).json({ message: "isAvailble must be boolean" });
    }

    const rider = await Rider.findOne({ userId: user._id });
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    rider.isAvailble = isAvailble;
    if (latitude !== undefined && longitude !== undefined) {
      rider.location = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
    }
    rider.lastActiveAt = new Date();
    await rider.save();

    return res.json({
      message: isAvailble ? "You are now ONLINE and ready for orders" : "You are now OFFLINE",
      rider,
    });
  }
);

export const broadcastOrderToRiders = TryCatch(
  async (req: Request, res: Response) => {
    const { orderId, restaurantId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const availableRiders = await Rider.find({ isAvailble: true });
    console.log(`📢 Broadcasting order ${orderId} to ${availableRiders.length} online riders`);

    const realtimeUrl = process.env.REALTIME_SERVICE || "http://127.0.0.1:5005";
    const internalKey = process.env.INTERNAL_SERVICE_KEY || "internal_secret_key";

    // 1. Broadcast to "riders" room
    try {
      await axios.post(
        `${realtimeUrl}/api/v1/internal/emit`,
        {
          event: "order:available",
          room: "riders",
          payload: { orderId, restaurantId },
        },
        {
          headers: { "x-internal-key": internalKey },
        }
      );
    } catch (err) {
      console.warn("Failed to broadcast to riders room:", err);
    }

    // 2. Direct broadcast to each online rider's user room
    for (const rider of availableRiders) {
      try {
        await axios.post(
          `${realtimeUrl}/api/v1/internal/emit`,
          {
            event: "order:available",
            room: `user:${rider.userId}`,
            payload: { orderId, restaurantId },
          },
          {
            headers: { "x-internal-key": internalKey },
          }
        );
      } catch {
        // Non-blocking
      }
    }

    return res.json({
      success: true,
      notifiedCount: availableRiders.length,
    });
  }
);

export const getAvailablePendingOrders = TryCatch(
  async (req: Request, res: Response) => {
    const restaurantServiceUrl = process.env.RESTAURANT_SERVICE || "http://127.0.0.1:5001";
    try {
      const { data } = await axios.get(
        `${restaurantServiceUrl}/api/order/pending/unassigned`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY || "internal_secret_key",
          },
        }
      );
      return res.json({ orders: data.orders || [] });
    } catch {
      return res.json({ orders: [] });
    }
  }
);

export const acceptOrder = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const riderUserId = req.user?._id;
    const { orderId } = req.params;

    if (!riderUserId) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }

    const rider = await Rider.findOne({ userId: riderUserId });
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    try {
      const restaurantServiceUrl = process.env.RESTAURANT_SERVICE || "http://127.0.0.1:5001";
      const { data } = await axios.put(
        `${restaurantServiceUrl}/api/order/assign/rider`,
        {
          orderId,
          riderId: rider._id.toString(),
          riderUserId: rider.userId,
          riderName: req.user?.name || "Nomato Delivery Partner",
          riderPhone: rider.phoneNumber,
        },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY || "internal_secret_key",
          },
        }
      );

      if (data.success) {
        rider.isAvailble = false;
        await rider.save();

        return res.json({ message: "Order accepted successfully!" });
      }
    } catch (error: any) {
      return res.status(400).json({
        message: error.response?.data?.message || "Order already accepted by another partner",
      });
    }
  }
);

export const fetchMyCurrentOrder = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const riderUserId = req.user?._id;
    if (!riderUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rider = await Rider.findOne({ userId: riderUserId });
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    try {
      const restaurantServiceUrl = process.env.RESTAURANT_SERVICE || "http://127.0.0.1:5001";
      const { data } = await axios.get(
        `${restaurantServiceUrl}/api/order/current/rider?riderId=${rider._id}`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY || "internal_secret_key",
          },
        }
      );

      return res.json({ order: data });
    } catch {
      return res.json({ order: null });
    }
  }
);

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    try {
      const restaurantServiceUrl = process.env.RESTAURANT_SERVICE || "http://127.0.0.1:5001";
      const { data } = await axios.put(
        `${restaurantServiceUrl}/api/order/update/status/rider`,
        { orderId, status },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY || "internal_secret_key",
          },
        }
      );

      return res.json({
        message: data.message || "Delivery status updated",
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.response?.data?.message || "Failed to update delivery status",
      });
    }
  }
);
