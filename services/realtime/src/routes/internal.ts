import express, { Request, Response } from "express";
import { getIO } from "../socket";

const router = express.Router();

router.post("/emit", (req: Request, res: Response) => {
  const incomingKey = req.headers["x-internal-key"];
  const expectedKey = process.env.INTERNAL_SERVICE_KEY || "internal_secret_key";

  if (incomingKey !== expectedKey) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { event, room, payload } = req.body;
  if (!event || !room) {
    return res.status(400).json({ message: "event and room are required" });
  }

  try {
    const io = getIO();
    console.log(`📶 Emitting event "${event}" to room "${room}"`);
    io.to(room).emit(event, payload ?? {});
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Socket emit error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
