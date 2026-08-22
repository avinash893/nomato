import React, { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave, BiPhone, BiLogOut, BiCheckCircle, BiXCircle } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface RestaurantProfileProps {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile: React.FC<RestaurantProfileProps> = ({
  restaurant,
  isSeller,
  onUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description || "");
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);
  const { setIsAuth, setUser } = useAppData();

  const toggleOpenStatus = async () => {
    try {
      const nextStatus = !isOpen;
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message || `Restaurant marked as ${nextStatus ? "Open" : "Closed"}`);
      setIsOpen(nextStatus);
      onUpdate({ ...restaurant, isOpen: nextStatus });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const saveChanges = async () => {
    if (!name.trim()) {
      toast.error("Restaurant name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name: name.trim(), description: description.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message || "Profile updated successfully!");
      if (data.restaurant) {
        onUpdate(data.restaurant);
      }
      setEditMode(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: false },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const formattedAddr =
    restaurant.autoLocation?.formattedAddress ||
    (typeof restaurant.location === "string" ? restaurant.location : "") ||
    "Location not specified";

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      {/* Banner / Header Image */}
      <div className="relative h-60 w-full bg-gradient-to-r from-gray-900 to-gray-800">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover opacity-85"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/40 text-xl font-bold">
            Nomato Partner Restaurant
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Badges on Hero */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md backdrop-blur-md ${
              isOpen
                ? "bg-emerald-500/90 text-white"
                : "bg-rose-500/90 text-white"
            }`}
          >
            {isOpen ? <BiCheckCircle size={14} /> : <BiXCircle size={14} />}
            {isOpen ? "ACCEPTING ORDERS" : "CURRENTLY CLOSED"}
          </span>
        </div>

        {/* Title overlay on banner */}
        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
          <div className="text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-200 drop-shadow">
              <BiMapPin className="text-red-400 shrink-0" size={16} />
              <span className="line-clamp-1">{formattedAddr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details & Controls */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Store ID: {restaurant._id.slice(-6).toUpperCase()}
              </span>
              {restaurant.phone && (
                <div className="flex items-center gap-1 text-xs text-gray-600 font-medium bg-gray-50 px-2.5 py-1 rounded-lg">
                  <BiPhone className="text-gray-400" />
                  <span>{restaurant.phone}</span>
                </div>
              )}
            </div>
          </div>

          {isSeller && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={toggleOpenStatus}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                  isOpen
                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                {isOpen ? "Pause / Close Kitchen" : "Open Kitchen"}
              </button>

              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
              >
                <BiEdit size={16} />
                {editMode ? "Cancel" : "Edit Info"}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
              >
                <BiLogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Edit mode or Display mode */}
        {editMode ? (
          <div className="space-y-4 bg-gray-50/60 p-5 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                About / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={saveChanges}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow transition disabled:opacity-60 cursor-pointer"
              >
                <BiSave size={16} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              About This Kitchen
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {restaurant.description || "No description added yet. Click 'Edit Info' to add details about your cuisine and specialties."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantProfile;
