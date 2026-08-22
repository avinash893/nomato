import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  itemId: string;
  name: string;
  price: number;
  quauntity: number;
}

export interface IOrder extends Document {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string | null;
  riderPhone?: number | string | null;
  riderName?: string | null;
  distance: number;
  riderAmount: number;

  items: IOrderItem[];

  subtotal: number;
  deliveryFee: number;
  platfromFee: number;
  totalAmount: number;

  addressId: string;

  deliveryAddress: {
    fromattedAddress: string;
    mobile: number | string;
    latitude: number;
    longitude: number;
  };

  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_rider"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";

  paymentMethod: "razorpay" | "stripe" | "cod";
  paymentStatus: "pending" | "paid" | "failed";

  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    restaurantId: {
      type: String,
      required: true,
      index: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    riderId: {
      type: String,
      default: null,
      index: true,
    },
    riderName: {
      type: String,
      default: null,
    },
    riderPhone: {
      type: Schema.Types.Mixed,
      default: null,
    },
    riderAmount: {
      type: Number,
      default: 50,
    },
    distance: {
      type: Number,
      default: 2.5,
    },

    items: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quauntity: { type: Number, required: true, default: 1 },
      },
    ],

    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    platfromFee: { type: Number, default: 7 },
    totalAmount: { type: Number, required: true },

    addressId: {
      type: String,
      required: true,
    },

    deliveryAddress: {
      fromattedAddress: { type: String, required: true },
      mobile: { type: Schema.Types.Mixed, required: true },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready_for_rider",
        "rider_assigned",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "cod"],
      default: "razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
