import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import { Response } from "express";
import Restaurant from "../models/restaurant";
import getBuffer from "../config/datauri";
import axios from "axios";
import jwt from "jsonwebtoken";

export const addRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized, please login first" });
    }

    const existingRestaurant = await Restaurant.findOne({
      $or: [{ ownerId: user._id }, { owner: user._id }],
    });

    if (existingRestaurant) {
      return res
        .status(400)
        .json({ message: "A restaurant is already registered under this account" });
    }

    const { name, description, location, phone, latitude, longitude, formattedAddress } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Restaurant banner image is required" });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(400).json({ message: "Invalid image file provided" });
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      }
    );

    const lat = latitude ? Number(latitude) : 0;
    const lon = longitude ? Number(longitude) : 0;

    const restaurant = await Restaurant.create({
      name,
      description: description || "",
      location: location || formattedAddress || "",
      phone,
      image: uploadResult.url,
      ownerId: user._id,
      owner: user._id,
      autoLocation: {
        type: "Point",
        coordinates: [lon, lat],
        formattedAddress: formattedAddress || location || "",
      },
      isVerified: true,
      isOpen: true,
    });

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  }
);

export const fetchMyRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized, please login first",
      });
    }

    const restaurant = await Restaurant.findOne({
      $or: [{ ownerId: req.user._id }, { owner: req.user._id }],
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "No Restaurant found",
      });
    }

    if (!req.user.restaurantId) {
      const secret = process.env.JWT_SECRET || process.env.JWT_SEC || "your_jwt_secret_key";
      const token = jwt.sign(
        {
          user: {
            ...req.user,
            restaurantId: restaurant._id.toString(),
          },
        },
        secret,
        {
          expiresIn: "15d",
        }
      );

      return res.json({ restaurant, token });
    }

    return res.json({ restaurant });
  }
);

export const updateStatusRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({
        message: "Status must be a boolean",
      });
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { $or: [{ ownerId: req.user._id }, { owner: req.user._id }] },
      { isOpen: status },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    return res.json({
      message: `Restaurant is now ${status ? "Open" : "Closed"}`,
      restaurant,
    });
  }
);

export const updateRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const { name, description } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate(
      { $or: [{ ownerId: req.user._id }, { owner: req.user._id }] },
      { name, description },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    return res.json({
      message: "Restaurant details updated successfully",
      restaurant,
    });
  }
);

export const getNearbyRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const { latitude, longitude, radius = 10000, search = "" } = req.query;

    const query: Record<string, any> = {};

    if (search && typeof search === "string") {
      query.name = { $regex: search, $options: "i" };
    }

    if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      try {
        const restaurants = await Restaurant.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              },
              distanceField: "distance",
              maxDistance: Number(radius),
              spherical: true,
              query,
            },
          },
          {
            $sort: {
              isOpen: -1,
              distance: 1,
            },
          },
          {
            $addFields: {
              distanceKm: {
                $round: [{ $divide: ["$distance", 1000] }, 2],
              },
            },
          },
        ]);

        return res.json({
          success: true,
          count: restaurants.length,
          restaurants,
        });
      } catch {
        // Fallback to regular find if geo index isn't ready or outside bounds
        const fallbackRestaurants = await Restaurant.find(query).sort({ isOpen: -1, createdAt: -1 });
        return res.json({
          success: true,
          count: fallbackRestaurants.length,
          restaurants: fallbackRestaurants,
        });
      }
    }

    const restaurants = await Restaurant.find(query).sort({ isOpen: -1, createdAt: -1 });
    return res.json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  }
);

export const fetchSingleRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    return res.json(restaurant);
  }
);
