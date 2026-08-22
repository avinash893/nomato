import mongoose, { Document, Schema } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  description?: string;
  image: string;
  location?: string;
  phone: string;
  isVerified: boolean;
  isOpen: boolean;
  ownerId: string;
  owner?: mongoose.Types.ObjectId;
  autoLocation: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    formattedAddress: string;
  };
  autolocation?: {
    type: "Point";
    coordinates: [number, number];
    formattedAddress: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    autoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formattedAddress: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ autoLocation: "2dsphere" });

export default mongoose.model<IRestaurant>("Restaurant", schema);
