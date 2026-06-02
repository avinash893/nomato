import express from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer } = req.body;
    const cloud = await cloudinary.v2.uploader.upload(buffer);

    res.json({ url: cloud.secure_url });
  } catch (error: any) {
    console.error("Error uploading file to Cloudinary:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;
