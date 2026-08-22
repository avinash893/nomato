import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next();
      }

      const secret = process.env.JWT_SECRET || process.env.JWT_SEC || "your_jwt_secret_key";
      const decoded = jwt.verify(token, secret) as any;

      if (decoded && decoded.user) {
        socket.data.user = decoded.user;
      }

      next();
    } catch (error) {
      console.log("Socket token auth warning:", error);
      next();
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    if (user) {
      const userId = user._id;
      socket.join(`user:${userId}`);

      if (user.restaurantId) {
        socket.join(`restaurant:${user.restaurantId}`);
      }

      if (user.role === "rider") {
        socket.join("riders");
      }

      console.log(`Socket user joined rooms for: ${userId} (role: ${user.role})`);
    }

    socket.on("join", (room: string) => {
      if (room) {
        socket.join(room);
        console.log(`Socket joined room: ${room}`);
      }
    });

    socket.on("leave", (room: string) => {
      if (room) {
        socket.leave(room);
        console.log(`Socket left room: ${room}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket client disconnected");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
