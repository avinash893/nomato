import { ObjectId } from "mongodb";
import TryCatch from "../middlewares/trycatch";
import {
  getRestaurantCollection,
  getRiderCollection,
} from "../util/collection";
import { Request, Response } from "express";

export const getPendingRestaurant = TryCatch(
  async (req: Request, res: Response) => {
    const collection = await getRestaurantCollection();
    const restaurants = await collection.find({ isVerified: false }).toArray();

    return res.json({
      count: restaurants.length,
      restaurants,
    });
  }
);

export const getPendingRiders = TryCatch(
  async (req: Request, res: Response) => {
    const collection = await getRiderCollection();
    const riders = await collection.find({ isVerified: false }).toArray();

    return res.json({
      count: riders.length,
      riders,
    });
  }
);

export const verifyRestaurant = TryCatch(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const collection = await getRestaurantCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.json({
      message: "Restaurant verified successfully! Now visible to customers.",
      success: true,
    });
  }
);

export const verifyRider = TryCatch(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid rider ID" });
    }

    const collection = await getRiderCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Rider not found" });
    }

    return res.json({
      message: "Rider verified successfully! Partner can now go online.",
      success: true,
    });
  }
);
