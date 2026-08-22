import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  userId: string;
  mobile: number | string;
  formattedAddress: string;
  label?: string; // e.g. "Home", "Work", "Other"
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAddress>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    mobile: {
      type: Schema.Types.Mixed,
      required: true,
    },
    formattedAddress: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "Home",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ location: "2dsphere" });

export default mongoose.model<IAddress>("Address", schema);
