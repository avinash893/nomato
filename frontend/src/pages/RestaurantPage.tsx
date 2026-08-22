import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import { BiArrowBack } from "react-icons/bi";

const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/${id}`
      );
      setRestaurant(data || null);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${id}`
      );
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category || "General")))];

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((i) => (i.category || "General") === selectedCategory);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading menu & restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-4xl">🍽️</div>
        <h2 className="text-xl font-bold text-gray-800">Restaurant Not Found</h2>
        <p className="text-xs text-gray-500">
          The restaurant you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow hover:bg-red-700 cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-red-600 transition bg-white px-3.5 py-2 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
      >
        <BiArrowBack size={16} />
        <span>Back</span>
      </button>

      {/* Restaurant Hero Profile */}
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={setRestaurant}
        isSeller={false}
      />

      {/* Menu Catalog Section */}
      <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Menu & Dishes</h2>
            <p className="text-xs text-gray-500">Select dishes to add to your order</p>
          </div>

          {/* Category Chips */}
          {categories.length > 2 && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-red-600 text-white shadow-sm shadow-red-100"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <MenuItems
          isSeller={false}
          items={filteredItems}
          onItemDeleted={() => {}}
        />
      </div>
    </div>
  );
};

export default RestaurantPage;
