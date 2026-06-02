import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();

const app = express();

app.listen(Number(process.env.PORT), "0.0.0.0", () => {
  console.log(`restaurant service is running on port ${process.env.PORT}`);
  connectDB();
});
