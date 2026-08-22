/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import axios from "axios";
import { authService, utilsService, restaurantService } from "../config";
import type { AppContextType, ICartItem, LocationData, User } from "../types";

function sanitizeEnglish(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u0900-\u097F]/gu, "")
    .replace(/\s*,\s*,\s*/g, ", ")
    .replace(/^\s*,\s*/, "")
    .replace(/\s*,\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

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

  const [cart, setCart] = useState<ICartItem[] | null>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [quauntity, setQuauntity] = useState(0);

  const fetchUser = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get("token");
      if (queryToken) {
        localStorage.setItem("token", queryToken);
      }

      const token = localStorage.getItem("token");

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
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCart([]);
      setSubTotal(0);
      setQuauntity(0);
      return;
    }

    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(data.cart || []);
      setSubTotal(data.subtotal || 0);
      setQuauntity(data.cartLength || (data.cart ? data.cart.length : 0));
    } catch (error) {
      // Cart might be empty or service not ready
      setCart([]);
      setSubTotal(0);
      setQuauntity(0);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchCart();
    }
  }, [user, fetchCart]);

  const fetchLocation = async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      setCity("Location not supported");
      return null;
    }

    setLoadingLocation(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // 1. Try our backend reverse geocode service
            const { data } = await axios.get(
              `${utilsService}/api/geocode/reverse?lat=${latitude}&lon=${longitude}`
            );

            if (data && data.formattedAddress) {
              const cleanAddress = sanitizeEnglish(data.formattedAddress);
              const cleanCity =
                sanitizeEnglish(data.city) ||
                cleanAddress.split(",")[0] ||
                "Detected Location";

              setCity(cleanCity);

              const locData: LocationData = {
                latitude,
                longitude,
                formattedAddress: cleanAddress,
                pincode: data.pincode || "",
                city: cleanCity,
                state: sanitizeEnglish(data.state),
              };

              setLocation(locData);
              setLoadingLocation(false);
              resolve(locData);
              return;
            }
          } catch (err) {
            console.warn("Backend geocoding failed, trying BigDataCloud:", err);
          }

          // 2. Direct browser fallback
          try {
            const { data: bdcData } = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            const postcode = bdcData.postcode || "";
            const adminParts = (bdcData.localityInfo?.administrative || [])
              .map((item: any) => sanitizeEnglish(item.name))
              .reverse()
              .filter(Boolean);

            const parts = [
              sanitizeEnglish(bdcData.locality),
              sanitizeEnglish(bdcData.city),
              ...adminParts,
              postcode,
              sanitizeEnglish(bdcData.countryName) || "India",
            ].filter(Boolean);

            const uniqueParts = Array.from(new Set(parts));
            const formatted = uniqueParts.join(", ");
            const shortCity =
              sanitizeEnglish(bdcData.city || bdcData.locality) ||
              "Detected Location";

            setCity(shortCity);

            const locData: LocationData = {
              latitude,
              longitude,
              formattedAddress:
                formatted ||
                `Location at ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
              pincode: postcode,
              city: shortCity,
              state: sanitizeEnglish(bdcData.principalSubdivision),
            };

            setLocation(locData);
            setLoadingLocation(false);
            resolve(locData);
          } catch (fallbackErr) {
            console.error("All reverse geocoding methods failed:", fallbackErr);
            const fallbackStr = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
            setCity("GPS Detected");
            const locData: LocationData = {
              latitude,
              longitude,
              formattedAddress: fallbackStr,
            };
            setLocation(locData);
            setLoadingLocation(false);
            resolve(locData);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setCity("Location access denied");
          setLoadingLocation(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    });
  };

  useEffect(() => {
    fetchLocation();
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
        fetchLocation,
        cart,
        fetchCart,
        subTotal,
        quauntity,
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
