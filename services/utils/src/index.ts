import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import uploadRouter from "./routes/cloudinarry";
import geocodeRouter from "./routes/geocode";
import paymentRouter from "./routes/payment";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;

if (CLOUD_NAME && CLOUD_API_KEY && CLOUD_SECRET_KEY) {
  cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_SECRET_KEY,
  });
} else {
  console.warn(
    "Cloudinary configuration is missing. Uploads will run with fallback."
  );
}

app.use("/api", uploadRouter);
app.use("/api/geocode", geocodeRouter);
app.use("/api/payment", paymentRouter);

const PORT = Number(process.env.PORT) || 5002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Utils service is running on port ${PORT}`);
});

export default app;
