import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import restaurantRoutes from "./routes/restaurant";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/restaurant", restaurantRoutes);

app.listen(Number(process.env.PORT), "0.0.0.0", () => {
  console.log(`restaurant service is running on port ${process.env.PORT}`);
  connectDB();
});
