import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState, useMemo } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import RestaurantCard from "../components/RestaurantCard";
import { BiSearch, BiMapPin, BiSliderAlt } from "react-icons/bi";

const CUISINES = [
  "All",
  "Biryani",
  "North Indian",
  "Chinese",
  "Fast Food",
  "Desserts",
  "Beverages",
  "South Indian",
  "Pizza",
];

const Home = () => {
  const { location, city, loadingLocation } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const [selectedCuisine, setSelectedCuisine] = useState("All");

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(1);
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};

      if (location?.latitude && location?.longitude) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }
      if (search) {
        params.search = search;
      }

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        { params }
      );

      setRestaurants(data.restaurants || []);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  const filteredRestaurants = useMemo(() => {
    if (selectedCuisine === "All") return restaurants;
    return restaurants.filter((r) => {
      const matchDesc = r.description?.toLowerCase().includes(selectedCuisine.toLowerCase());
      const matchName = r.name?.toLowerCase().includes(selectedCuisine.toLowerCase());
      return matchDesc || matchName;
    });
  }, [restaurants, selectedCuisine]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
              <BiMapPin size={14} />
              {loadingLocation ? "Detecting location..." : `Delivering to ${city}`}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Order delicious food from top restaurants
            </h1>
            <p className="text-sm sm:text-base text-red-100 font-light">
              Freshly prepared meals delivered hot to your doorstep in minutes.
            </p>
          </div>

          {/* Search bar inside Hero */}
          <div className="max-w-2xl">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-xl shadow-red-900/10">
              <BiSearch className="text-gray-400 ml-3 shrink-0" size={22} />
              <input
                type="text"
                placeholder="Search for restaurants, dishes, cuisines..."
                value={search}
                onChange={(e) => setSearchParams({ search: e.target.value })}
                className="w-full px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearchParams({})}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-3 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cuisines Filter Bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 shrink-0">
            <BiSliderAlt size={16} />
            <span>Filter:</span>
          </div>
          {CUISINES.map((cuisine) => {
            const isSelected = selectedCuisine === cuisine;
            return (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-red-600 text-white shadow-sm shadow-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Restaurant Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {search ? `Results for "${search}"` : "Nearby Restaurants"}
            </h2>
            <p className="text-xs text-gray-500">
              {filteredRestaurants.length} kitchens ready to take your order
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-64 rounded-3xl bg-white p-4 shadow-sm animate-pulse space-y-3"
              >
                <div className="h-40 rounded-2xl bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRestaurants.map((res) => {
              let distanceStr = "2.5";
              if (
                location?.latitude &&
                location?.longitude &&
                res.autoLocation?.coordinates
              ) {
                const [resLng, resLat] = res.autoLocation.coordinates;
                distanceStr = `${getDistanceKm(
                  location.latitude,
                  location.longitude,
                  resLat,
                  resLng
                )}`;
              } else if (res.distanceKm) {
                distanceStr = `${res.distanceKm}`;
              }

              return (
                <RestaurantCard
                  key={res._id}
                  id={res._id}
                  name={res.name}
                  image={res.image || ""}
                  distance={distanceStr}
                  isOpen={res.isOpen}
                  description={res.description}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 text-2xl">
              🔍
            </div>
            <h3 className="text-base font-bold text-gray-800">No restaurants match your search</h3>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search keywords or switching cuisine categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
