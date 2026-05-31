import type React from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  location: LocationData | null;
  setLocation: React.Dispatch<React.SetStateAction<LocationData | null>>;
  loadingLocation: boolean;
  setLoadingLocation: React.Dispatch<React.SetStateAction<boolean>>;
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
}
