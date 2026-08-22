import type React from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  restaurantId?: string;
  phone?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  pincode?: string;
  city?: string;
  state?: string;
}

export interface IRestaurant {
  _id: string;
  name: string;
  description?: string;
  image: string;
  location?: string;
  ownerId: string;
  phone: string | number;
  isVerified: boolean;
  isOpen: boolean;
  autoLocation: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    formattedAddress: string;
  };
  distanceKm?: number;
  distance?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface IMenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  category?: string;
  isAvailable: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface ICartItem {
  _id: string;
  userId: string;
  restaurantId: string | IRestaurant;
  itemId: string | IMenuItem;
  quauntity: number;
  quantity?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IAddress {
  _id: string;
  userId: string;
  label: string; // 'Home' | 'Work' | 'Other'
  formattedAddress: string;
  mobile: number | string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  createdAt?: string | Date;
}

export interface IOrder {
  _id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string | null;
  riderPhone?: number | string | null;
  riderName?: string | null;
  distance?: number;
  riderAmount?: number;

  items: {
    itemId: string;
    name: string;
    price: number;
    quauntity: number;
  }[];

  subtotal: number;
  deliveryFee: number;
  platfromFee: number;
  totalAmount: number;

  addressId?: string;
  deliveryAddress: {
    fromattedAddress: string;
    mobile: number | string;
    latitude: number;
    longitude: number;
  };

  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_rider"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";

  paymentMethod: "razorpay" | "stripe" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  expiresAt?: Date;
  createdAt: string | Date;
  updatedAt: string | Date;
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
  fetchLocation: () => Promise<LocationData | null>;
  cart: ICartItem[] | null;
  fetchCart: () => Promise<void>;
  subTotal: number;
  quauntity: number;
}