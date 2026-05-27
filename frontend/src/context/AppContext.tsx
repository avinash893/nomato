import { createContext, useState, type ReactNode } from "react";
import axios from "axios";
import { useEffect } from "react";
im;

const AppContext = createContext(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching location...");

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get("$authServiceUrl/api/auth/me", {
        headers: {
          Authorization: "Bearer ${token}",
        },
      });
      setUser(data.user);
      setIsAuth(true);
      setLoading(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{ user, isAuth, loading, location, loadingLocation, city }}
    >
      {children}
    </AppContext.Provider>
  );
};
