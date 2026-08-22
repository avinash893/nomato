import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";
import { realtimeService } from "../config";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth } = useAppData();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketInstance(null);
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const socket = io(realtimeService, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;
      setSocketInstance(socket);

      socket.on("connect", () => {
        console.log("🟢 Live Socket Connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Live Socket Disconnected");
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
        setSocketInstance(null);
      };
    } catch (err) {
      console.warn("Socket initialization non-blocking warning:", err);
    }
  }, [isAuth]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
