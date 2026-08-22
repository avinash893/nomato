import React, { useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService } from "../config";
import toast from "react-hot-toast";

interface AddRestaurantProps {
  fetchMyRestaurant?: () => void;
}

const AddRestaurant: React.FC<AddRestaurantProps> = ({ fetchMyRestaurant }) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { loadingLocation, location, fetchLocation } = useAppData();

  const handleUseCurrentLocation = async () => {
    try {
      let loc = location;
      if (!loc?.formattedAddress) {
        loc = await fetchLocation();
      }
      if (loc?.formattedAddress) {
        setAddress(loc.formattedAddress);
        toast.success("Detailed location auto-filled!");
      } else {
        toast.error("Location not detected yet. Please allow location access.");
      }
    } catch {
      toast.error("Failed to retrieve location.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !address || !phone || !image) {
      toast.error("Please fill in all fields and select an image.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("location", address);
      formData.append("phone", phone);
      formData.append("file", image);

      if (location) {
        formData.append("latitude", location.latitude.toString());
        formData.append("longitude", location.longitude.toString());
        formData.append("formattedAddress", location.formattedAddress || address);
      }

      const { data } = await axios.post(
        `${restaurantService}/api/restaurant/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(data.message || "Restaurant created successfully!");
      if (fetchMyRestaurant) {
        fetchMyRestaurant();
      }
    } catch (err: any) {
      console.error("Error creating restaurant:", err);
      if (err.response?.status === 403) {
        toast.error("Forbidden: You must select the 'seller' role on the Select Role page first.");
      } else {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to create restaurant");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Register Your Restaurant</h2>
        <p className="text-sm text-gray-500 mb-6">
          Provide your restaurant details to start receiving orders on Nomato.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
            <input
              type="text"
              placeholder="e.g. Spice Garden"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Brief description of your restaurant, cuisine, or specialty..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Address / Location</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={loadingLocation}
                className="text-xs text-red-500 hover:underline font-medium"
              >
                {loadingLocation ? "Detecting..." : "Auto-fill current location"}
              </button>
            </div>
            <input
              type="text"
              placeholder="Full restaurant address (e.g. Building, Street, Area, City, Pin)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
            {location?.formattedAddress && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {location.pincode && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-200">
                    PIN: {location.pincode}
                  </span>
                )}
                {address !== location.formattedAddress && (
                  <button
                    type="button"
                    onClick={() => setAddress(location.formattedAddress)}
                    className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 text-left"
                  >
                    📍 GPS Detected: <span className="text-gray-700 font-medium underline truncate max-w-sm">{location.formattedAddress}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Banner / Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-500 hover:file:bg-red-100"
              required
            />
            {image && (
              <p className="mt-1 text-xs text-green-600 font-medium">
                Selected: {image.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 bg-red-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-200 disabled:opacity-50"
          >
            {submitting ? "Registering Restaurant..." : "Register Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurant;