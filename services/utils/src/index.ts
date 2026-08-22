import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import uploadRouter from "./routes/cloudinarry";
import geocodeRouter from "./routes/geocode";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
  console.error(
    "Cloudinary configuration is missing. Please set CLOUD_NAME, CLOUD_API_KEY, and CLOUD_SECRET_KEY in the .env file.",
  );
  process.exit(1);
}

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});
app.use("/api", uploadRouter);
app.use("/api/geocode", geocodeRouter);

const PORT = process.env.PORT || 5002;
app.listen(Number(PORT), () => {
  console.log(`Utils service is running on port ${PORT}`);
});

export default app;
