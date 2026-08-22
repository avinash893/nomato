import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import Address from "../models/Address";
import { Response } from "express";

export const addAddress = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized, please login first",
      });
    }

    const { mobile, formattedAddress, latitude, longitude, label } = req.body;

    if (
      !mobile ||
      !formattedAddress ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "Mobile, address, latitude, and longitude are required",
      });
    }

    const newAddress = await Address.create({
      userId: user._id.toString(),
      mobile,
      formattedAddress,
      label: label || "Home",
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  }
);

export const deleteAddress = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized, please login first",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Address ID is required",
      });
    }

    const address = await Address.findOne({
      _id: id,
      userId: user._id.toString(),
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found or unauthorized",
      });
    }

    await address.deleteOne();

    return res.json({
      message: "Address deleted successfully",
    });
  }
);

export const getMyAddresses = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized, please login first",
      });
    }

    const addresses = await Address.find({
      userId: user._id.toString(),
    }).sort({ createdAt: -1 });

    return res.json(addresses);
  }
);
