import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState, useMemo } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import RestaurantCard from "../components/RestaurantCard";
import FilterModal, { type FilterState } from "../components/FilterModal";
import { SHOWCASE_RESTAURANTS } from "../data/showcaseData";
import { BiSearch, BiMapPin, BiSliderAlt, BiReset } from "react-icons/bi";

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

const DEFAULT_FILTERS: FilterState = {
  vegType: "all",
  maxDistance: null,
  maxMakingTime: null,
  sortBy: "default",
};

const Home = () => {
  const { location, city, loadingLocation } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const [selectedCuisine, setSelectedCuisine] = useState("All");

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state & modal open state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

  const getRestaurantDistance = (res: IRestaurant): number => {
    if (
      location?.latitude &&
      location?.longitude &&
      res.autoLocation?.coordinates
    ) {
      const [resLng, resLat] = res.autoLocation.coordinates;
      return getDistanceKm(location.latitude, location.longitude, resLat, resLng);
    }
    return res.distanceKm || (typeof res.distance === "number" ? res.distance : 2.5);
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

      const backendList = data.restaurants || [];
      if (backendList.length > 0) {
        setRestaurants(
          backendList.map((r: any, idx: number) => ({
            ...r,
            makingTime:
              r.makingTime || (idx % 3 === 0 ? 15 : idx % 2 === 0 ? 20 : 30),
            foodType:
              r.foodType ||
              (r.isVeg
                ? "veg"
                : r.description?.toLowerCase().includes("chicken") ||
                  r.description?.toLowerCase().includes("mutton") ||
                  r.description?.toLowerCase().includes("biryani")
                ? "both"
                : "veg"),
            isVeg: r.isVeg ?? (r.foodType === "veg"),
          }))
        );
      } else {
        setRestaurants(
          Object.values(SHOWCASE_RESTAURANTS).map((s) => s.restaurant)
        );
      }
    } catch (error) {
      console.warn("Backend restaurants unavailable, displaying featured showcase:", error);
      setRestaurants(
        Object.values(SHOWCASE_RESTAURANTS).map((s) => s.restaurant)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  const activeFilterCount =
    (filters.vegType !== "all" ? 1 : 0) +
    (filters.maxDistance !== null ? 1 : 0) +
    (filters.maxMakingTime !== null ? 1 : 0) +
    (filters.sortBy !== "default" ? 1 : 0);

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        // 1. Cuisine filter
        if (selectedCuisine !== "All") {
          const matchDesc = r.description
            ?.toLowerCase()
            .includes(selectedCuisine.toLowerCase());
          const matchName = r.name
            ?.toLowerCase()
            .includes(selectedCuisine.toLowerCase());
          if (!matchDesc && !matchName) return false;
        }

        // 2. Veg / Non-Veg filter
        if (filters.vegType === "veg") {
          const isPureVeg = r.isVeg === true || r.foodType === "veg";
          if (!isPureVeg) return false;
        } else if (filters.vegType === "non-veg") {
          const hasNonVeg =
            r.foodType === "non-veg" ||
            r.foodType === "both" ||
            r.isVeg === false;
          if (!hasNonVeg) return false;
        }

        // 3. Distance filter
        const dist = getRestaurantDistance(r);
        if (filters.maxDistance !== null && dist > filters.maxDistance) {
          return false;
        }

        // 4. Making time filter
        const prepTime = r.makingTime || 25;
        if (filters.maxMakingTime !== null && prepTime > filters.maxMakingTime) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "distance") {
          return getRestaurantDistance(a) - getRestaurantDistance(b);
        }
        if (filters.sortBy === "makingTime") {
          return (a.makingTime || 25) - (b.makingTime || 25);
        }
        return 0;
      });
  }, [restaurants, selectedCuisine, filters, location]);

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
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-3 py-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cuisines & Interactive Filter Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Main Clickable Filters Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer shrink-0 shadow-sm ${
              activeFilterCount > 0
                ? "bg-red-600 text-white border-red-600 shadow-red-200"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            title="Click to open all filters (Veg/Non-Veg, Distance, Making Time)"
          >
            <BiSliderAlt size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-white text-red-600 text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Filter: Pure Veg */}
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                vegType: prev.vegType === "veg" ? "all" : "veg",
              }))
            }
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap cursor-pointer shrink-0 ${
              filters.vegType === "veg"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <span>🌱 Pure Veg</span>
          </button>

          {/* Quick Filter: Non-Veg */}
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                vegType: prev.vegType === "non-veg" ? "all" : "non-veg",
              }))
            }
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap cursor-pointer shrink-0 ${
              filters.vegType === "non-veg"
                ? "bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <span>🍗 Non-Veg</span>
          </button>

          {/* Quick Filter: Distance < 3km */}
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                maxDistance: prev.maxDistance === 3 ? null : 3,
              }))
            }
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap cursor-pointer shrink-0 ${
              filters.maxDistance === 3
                ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-200"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <span>📍 Under 3 km</span>
          </button>

          {/* Quick Filter: Making Time < 20m */}
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                maxMakingTime: prev.maxMakingTime === 20 ? null : 20,
              }))
            }
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap cursor-pointer shrink-0 ${
              filters.maxMakingTime === 20
                ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-200"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <span>⚡ Fast (&lt; 20m)</span>
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-200 mx-1 shrink-0" />

          {/* Cuisines Chips */}
          {CUISINES.map((cuisine) => {
            const isSelected = selectedCuisine === cuisine;
            return (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-gray-900 text-white shadow-sm"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {search ? `Results for "${search}"` : "Nearby Restaurants"}
            </h2>
            <p className="text-xs text-gray-500">
              {filteredRestaurants.length} kitchens ready to take your order
            </p>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setSelectedCuisine("All");
              }}
              className="self-start sm:self-auto flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <BiReset size={14} />
              <span>Reset Active Filters</span>
            </button>
          )}
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
              const distanceNum = getRestaurantDistance(res);
              const distanceStr = `${distanceNum}`;

              return (
                <RestaurantCard
                  key={res._id}
                  id={res._id}
                  name={res.name}
                  image={res.image || ""}
                  distance={distanceStr}
                  isOpen={res.isOpen}
                  description={res.description}
                  isVeg={res.isVeg}
                  foodType={res.foodType}
                  makingTime={res.makingTime || 25}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                No kitchens match your filter criteria
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Try loosening your distance, dietary, or making time filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setSelectedCuisine("All");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm shadow-red-200 transition cursor-pointer"
            >
              <BiReset size={16} />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal Dialog */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
        totalMatches={filteredRestaurants.length}
      />
    </div>
  );
};

export default Home;
