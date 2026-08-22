import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService, utilsService } from "../config";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import {
  BiLoaderAlt,
  BiPlus,
  BiTrash,
  BiMapPin,
  BiPhone,
  BiHomeAlt,
  BiBriefcase,
} from "react-icons/bi";
import type { IAddress } from "../types";

// Fix leaflet default marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Click on map to select location
const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Locate user button inside map
const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        toast.error("Location permission denied");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <button
      type="button"
      onClick={locateUser}
      className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-gray-800 shadow-lg hover:bg-gray-50 border border-gray-100 transition cursor-pointer"
    >
      <LuLocateFixed className={`text-red-500 ${locating ? "animate-spin" : ""}`} size={16} />
      <span>{locating ? "Detecting GPS..." : "Locate Me"}</span>
    </button>
  );
};

const AddressPage: React.FC = () => {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [label, setLabel] = useState("Home");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await axios.get(
        `${utilsService}/api/geocode/reverse?lat=${lat}&lon=${lng}`
      );
      if (res.data?.formattedAddress) {
        setFormattedAddress(res.data.formattedAddress);
        return;
      }
    } catch {
      // Fallback
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setFormattedAddress(data.display_name || `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setFormattedAddress(`Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  const handleSetLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // Default location to current position if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSetLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Default to New Delhi coordinates
          handleSetLocation(28.6139, 77.209);
        }
      );
    } else {
      handleSetLocation(28.6139, 77.209);
    }
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !formattedAddress.trim() || latitude === null || longitude === null) {
      toast.error("Please provide phone number and select a pin on the map");
      return;
    }

    try {
      setAdding(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${restaurantService}/api/address/new`,
        {
          formattedAddress,
          mobile: mobile.trim(),
          latitude,
          longitude,
          label,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Delivery address saved!");
      setMobile("");
      setFormattedAddress("");
      fetchAddresses();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this delivery address?")) return;
    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Address removed");
      fetchAddresses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Delivery Addresses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pinpoint your location on the map for accurate and fast doorstep deliveries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map & Address Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
            <MapContainer
              center={[latitude || 28.6139, longitude || 77.209]}
              zoom={14}
              className="h-full w-full"
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <LocationPicker setLocation={handleSetLocation} />
              <LocateMeButton onLocate={handleSetLocation} />
              {latitude && longitude && (
                <Marker position={[latitude, longitude]} />
              )}
            </MapContainer>
          </div>

          <form onSubmit={handleSaveAddress} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            {/* Selected formatted address indicator */}
            {formattedAddress && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3.5 text-xs text-emerald-800">
                <BiMapPin className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                <span className="font-medium leading-relaxed">{formattedAddress}</span>
              </div>
            )}

            {/* Label Chips */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Save Address As
              </label>
              <div className="flex gap-2">
                {[
                  { key: "Home", icon: BiHomeAlt },
                  { key: "Work", icon: BiBriefcase },
                  { key: "Other", icon: BiMapPin },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = label === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setLabel(item.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-red-600 text-white shadow-sm shadow-red-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{item.key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Contact Mobile Number *
              </label>
              <div className="relative">
                <BiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-red-100 hover:bg-red-700 transition disabled:opacity-60 cursor-pointer"
            >
              {adding ? (
                <>
                  <BiLoaderAlt className="animate-spin" size={18} />
                  <span>Saving Location...</span>
                </>
              ) : (
                <>
                  <BiPlus size={18} />
                  <span>Save Delivery Address</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Saved Addresses List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Saved Locations</h2>
            <p className="text-xs text-gray-400 mb-4">Click to select an address during checkout</p>

            {loading ? (
              <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                <BiLoaderAlt className="animate-spin text-red-500" size={24} />
                <span>Loading your saved addresses...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No addresses saved yet. Pick a point on the map to add one!
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-sm transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-extrabold uppercase">
                          {addr.label || "Home"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          📞 {addr.mobile}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-relaxed">
                        {addr.formattedAddress}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr._id)}
                      disabled={deletingId === addr._id}
                      title="Remove Address"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition disabled:opacity-40 cursor-pointer"
                    >
                      {deletingId === addr._id ? (
                        <BiLoaderAlt size={16} className="animate-spin text-red-500" />
                      ) : (
                        <BiTrash size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
