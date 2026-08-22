import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth";
import TryCatch from "../middlewares/trycatch";
import Cart from "../models/Cart";
import { Response } from "express";

export const addToCart = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const userId = req.user._id;
    const { restaurantId, itemId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        message: "Invalid restaurant or item ID",
      });
    }

    const cartFromDifferentRestaurant = await Cart.findOne({
      userId,
      restaurantId: { $ne: restaurantId },
    });

    if (cartFromDifferentRestaurant) {
      return res.status(400).json({
        message:
          "You can order from only one restaurant at a time. Please clear your cart first to add items from this restaurant.",
      });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { userId, restaurantId, itemId },
      {
        $inc: { quauntity: 1 },
        $setOnInsert: { userId, restaurantId, itemId },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: "Item added to cart",
      cart: cartItem,
    });
  }
);

export const fetchMyCart = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const userId = req.user._id;

    const cartItems = await Cart.find({ userId })
      .populate("itemId")
      .populate("restaurantId");

    let subtotal = 0;
    let cartLength = 0;

    for (const cartItem of cartItems) {
      const item: any = cartItem.itemId;
      if (item && item.price) {
        subtotal += item.price * cartItem.quauntity;
        cartLength += cartItem.quauntity;
      }
    }

    return res.json({
      success: true,
      cartLength,
      subtotal,
      cart: cartItems,
    });
  }
);

export const incrementCartItem = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        message: "Invalid request parameters",
      });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { userId, itemId },
      { $inc: { quauntity: 1 } },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    return res.json({
      message: "Quantity increased",
      cartItem,
    });
  }
);

export const decrementCartItem = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        message: "Invalid request parameters",
      });
    }

    const cartItem = await Cart.findOne({ userId, itemId });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    if (cartItem.quauntity <= 1) {
      await Cart.deleteOne({ userId, itemId });
      return res.json({
        message: "Item removed from cart",
      });
    }

    cartItem.quauntity -= 1;
    await cartItem.save();

    return res.json({
      message: "Quantity decreased",
      cartItem,
    });
  }
);

export const clearCart = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await Cart.deleteMany({ userId });

    return res.json({
      message: "Cart cleared successfully",
    });
  }
);
