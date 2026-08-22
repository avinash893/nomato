import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import { Response } from "express";
import Restaurant from "../models/restaurant";
import getBuffer from "../config/datauri";
import axios from "axios";

export const addRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized login first" });
      return;
    }

    const existingRestaurant = await Restaurant.findOne({
      owner: user._id,
    });

    if (existingRestaurant) {
      res
        .status(400)
        .json({ message: "Restaurant already exists for this user" });
      return;
    }

    const { name, description, location, phone, latitude, longitude, formattedAddress } = req.body;

    if (!name || !description || !location || !phone) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "Image is required" });
      return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      res.status(400).json({ message: "Invalid image file" });
      return;
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    const lat = latitude ? Number(latitude) : 0;
    const lon = longitude ? Number(longitude) : 0;

    const restaurant = await Restaurant.create({
      name,
      description,
      location,
      phone,
      image: uploadResult.url,
      owner: user._id,
      autolocation: {
        type: "Point",
        coordinates: [lon, lat],
        formattedAddress: formattedAddress || location,
      },
    });

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  },
);

export const fetchMyRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized login first",
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({ restaurant });
  },
);



