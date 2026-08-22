import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not configured for rider service");
      return;
    }
    await mongoose.connect(mongoUri, {
      dbName: "nomato",
    });
    console.log("Connected to MongoDB from Rider Service");
  } catch (error) {
    console.error("MongoDB Connection Error in Rider Service:", error);
  }
};

export default connectDB;
