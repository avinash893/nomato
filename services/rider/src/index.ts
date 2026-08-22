import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import riderRoutes from "./routes/rider";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/rider", riderRoutes);

const PORT = Number(process.env.PORT) || 5003;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Rider service is running on port ${PORT}`);
  connectDB();
});

export default app;
