import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import adminRoutes from "./routes/admin";
import { connectDb } from "./config/db";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/v1", adminRoutes);

const PORT = Number(process.env.PORT) || 5004;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Admin service is running on port ${PORT}`);
  await connectDb();
});

export default app;
