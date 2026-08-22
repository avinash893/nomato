import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import restaurantRoutes from "./routes/restaurant";
import menuItemRoutes from "./routes/menuitem";
import addressRoutes from "./routes/address";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/restaurant", restaurantRoutes);
app.use("/api/item", menuItemRoutes);
app.use("/api/address", addressRoutes);

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Restaurant service is running on port ${PORT}`);
  connectDB();
});
