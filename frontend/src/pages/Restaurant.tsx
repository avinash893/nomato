import { useState, useEffect } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import AddRestaurant from "../components/AddRestaurant";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyRestaurant = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${restaurantService}/api/restaurant/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRestaurant(data.restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
        <p className="text-gray-600 mt-1">{restaurant.description}</p>
        <p className="text-sm text-gray-500 mt-2">📍 {restaurant.location}</p>
        <p className="text-sm text-gray-500">📞 {restaurant.phone}</p>
      </div>
    </div>
  );
};

export default Restaurant;
