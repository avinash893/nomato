import { FormatterOptions } from "./../../../utils/node_modules/concurrently/dist/lib/date-format.d";
import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

export const addRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized login first" });
      return;
    }

    const existingRestaurant = await Restaurant.findOne({
      ownerId: user?._id,
    });

    if (existingRestaurant) {
      res
        .status(400)
        .json({ message: "Restaurant already exists for this user" });
      return;
    }

    const { name, description, address, FormattedAddress, phone } = req.body;

    if (!name || !description || !address || !phone) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
  },
);
