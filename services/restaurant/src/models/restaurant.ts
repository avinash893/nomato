import mongoose, { Document, Schema } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  description: string;
  image: string;
  location: string;
  phone: string;
  isVerified: boolean;
  isOpen: boolean;

  owner: mongoose.Types.ObjectId;
  autolocation: {
    type: "Point";
    coordinates: [number, number];
    formattedAddress: string;
    createdAt: Date;
  };
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
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    autolocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formattedAddress: String,
      isOpen: Boolean,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },

    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ autolocation: "2dsphere" });

export default mongoose.model<IRestaurant>("Restaurant", schema);
