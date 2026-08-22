import axios from "axios";
import getBuffer from "../config/datauri";
import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import Restaurant from "../models/restaurant";
import MenuItems from "../models/MenuItems";
import { Response } from "express";

export const addMenuItem = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const restaurant = await Restaurant.findOne({
      $or: [{ ownerId: req.user._id }, { owner: req.user._id }],
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "No Restaurant found for this account",
      });
    }

    const { name, description, price, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price are required",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Please provide an image for the menu item",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to create file buffer",
      });
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      }
    );

    const item = await MenuItems.create({
      name,
      description: description || "",
      price: Number(price),
      category: category || "General",
      restaurantId: restaurant._id,
      image: uploadResult.url,
      isAvailable: true,
    });

    return res.status(201).json({
      message: "Item Added Successfully",
      item,
    });
  }
);

export const getAllItems = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Restaurant ID is required",
      });
    }
    const items = await MenuItems.find({ restaurantId: id }).sort({ createdAt: -1 });
    return res.json(items);
  }
);

export const deleteMenuItem = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Item ID is required",
      });
    }

    const item = await MenuItems.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "No item found",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      $or: [{ ownerId: req.user._id }, { owner: req.user._id }],
    });

    if (!restaurant) {
      return res.status(403).json({
        message: "Unauthorized: You do not own this restaurant",
      });
    }

    await item.deleteOne();

    return res.json({
      message: "Menu item deleted successfully",
    });
  }
);

export const toggleMenuItemAvailability = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Item ID is required",
      });
    }

    const item = await MenuItems.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "No item found",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      $or: [{ ownerId: req.user._id }, { owner: req.user._id }],
    });

    if (!restaurant) {
      return res.status(403).json({
        message: "Unauthorized: You do not own this restaurant",
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    return res.json({
      message: `Item marked as ${
        item.isAvailable ? "available" : "unavailable"
      }`,
      item,
    });
  }
);
