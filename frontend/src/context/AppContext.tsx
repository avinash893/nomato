/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import { authService } from "../config";
import type { AppContextType, LocationData, User } from "../types";

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching location...");

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");

        // Exit early if the user is not logged in
        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await axios.get(`${authService}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data);
        setIsAuth(true);
      } catch (err) {
        console.error("Auth Error:", err);
        localStorage.removeItem("token"); // Clean up invalid/expired tokens
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("Location not supported");
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { data } = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const currentCity = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown Location";
          setCity(currentCity);
          setLocation({ latitude, longitude, formattedAddress: data.display_name });
        } catch (err) {
          console.error("Error fetching city data:", err);
          setCity("Unknown Location");
          setLocation({ latitude, longitude, formattedAddress: "Unknown" });
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setCity("Location access denied");
        setLoadingLocation(false);
      }
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        setIsAuth,
        user,
        setUser,
        loading,
        setLoading,
        location,
        setLocation,
        loadingLocation,
        setLoadingLocation,
        city,
        setCity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};



export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};
