import { useEffect, useState, useCallback } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import { BiFoodMenu, BiPlusCircle, BiShoppingBag, BiStats } from "react-icons/bi";

type SellerTab = "menu" | "add-item" | "orders" | "sales";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const fetchMyRestaurant = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRestaurant(data.restaurant || null);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = useCallback(async (restaurantId: string) => {
    try {
      setLoadingMenu(true);
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${restaurantId}`
      );
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant?._id) {
      fetchMenuItems(restaurant._id);
    }
  }, [restaurant, fetchMenuItems]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading your restaurant portal...</p>
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 pt-6 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Restaurant Overview Card */}
      <RestaurantProfile
        restaurant={restaurant}
        onUpdate={(updated) => setRestaurant(updated)}
        isSeller={true}
      />

      {/* Tabs Navigation */}
      <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5 gap-1.5 overflow-x-auto">
          {[
            { key: "menu", label: "Menu Catalog", icon: BiFoodMenu, count: menuItems.length },
            { key: "add-item", label: "Add Dish", icon: BiPlusCircle },
            { key: "orders", label: "Live Orders", icon: BiShoppingBag },
            { key: "sales", label: "Performance", icon: BiStats },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as SellerTab)}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold rounded-2xl transition cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-white text-red-600 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/70"
                }`}
              >
                <Icon size={18} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {tab === "menu" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Your Menu Items</h3>
                  <p className="text-xs text-gray-400">Manage pricing, photos, and item availability</p>
                </div>
                <button
                  onClick={() => setTab("add-item")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition cursor-pointer"
                >
                  <BiPlusCircle size={16} />
                  Add Dish
                </button>
              </div>

              {loadingMenu ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  Loading menu items...
                </div>
              ) : (
                <MenuItems
                  items={menuItems}
                  onItemDeleted={() => fetchMenuItems(restaurant._id)}
                  isSeller={true}
                />
              )}
            </div>
          )}

          {tab === "add-item" && (
            <AddMenuItem
              onItemAdded={() => {
                fetchMenuItems(restaurant._id);
                setTab("menu");
              }}
            />
          )}

          {tab === "orders" && (
            <RestaurantOrders restaurantId={restaurant._id} />
          )}

          {tab === "sales" && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BiStats size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-800">Sales & Analytics</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Track revenue, most popular dishes, customer ratings, and order history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
