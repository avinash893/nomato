import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { initSocket } from "./socket";
import internalRoutes from "./routes/internal";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initSocket(server);

app.use("/api/v1/internal", internalRoutes);

const PORT = Number(process.env.PORT) || 5005;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Realtime Socket service is running on port ${PORT}`);
});

export default app;
