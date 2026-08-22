import { Request, Response } from "express";
import axios from "axios";
import { razorpay } from "../config/razorpay";
import { verifyRazorpaySignature } from "../config/verifyRazorpay";

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const restaurantServiceUrl = process.env.RESTAURANT_SERVICE || "http://127.0.0.1:5001";
    const internalKey = process.env.INTERNAL_SERVICE_KEY || "internal_secret_key";

    const { data } = await axios.get(
      `${restaurantServiceUrl}/api/order/payment/${orderId}`,
      {
        headers: {
          "x-internal-key": internalKey,
        },
      }
    );

    let razorpayOrderId = `order_mock_${Date.now()}`;
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(data.amount * 100),
        currency: "INR",
        receipt: orderId,
      });
      razorpayOrderId = razorpayOrder.id;
    } catch (rzpErr) {
      console.warn("Razorpay API creation fallback:", rzpErr);
    }

    return res.json({
      razorpayOrderId,
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_key",
      amount: data.amount,
    });
  } catch (error: any) {
    console.error("createRazorpayOrder error:", error);
    return res.status(500).json({
      message: error.response?.data?.message || "Failed to create payment order",
    });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Payment verification failed: Invalid signature",
      });
    }

    const restaurantServiceUrl = process.env.RESTAURANT_SERVICE || "http://127.0.0.1:5001";
    const internalKey = process.env.INTERNAL_SERVICE_KEY || "internal_secret_key";

    // Notify restaurant service of payment success
    try {
      await axios.post(
        `${restaurantServiceUrl}/api/order/payment-success`,
        {
          orderId,
          paymentId: razorpay_payment_id,
          provider: "razorpay",
        },
        {
          headers: {
            "x-internal-key": internalKey,
          },
        }
      );
    } catch (notifyErr) {
      console.error("Failed to notify restaurant service of payment success:", notifyErr);
    }

    return res.json({
      message: "Payment verified successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("verifyRazorpayPayment error:", error);
    return res.status(500).json({
      message: "Payment verification error",
    });
  }
};
