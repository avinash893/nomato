import React, { useState } from "react";
import type { IMenuItem } from "../types";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { BsCartPlus } from "react-icons/bs";
import { BiTrash, BiRupee } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../config";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted?: () => void;
  isSeller: boolean;
}

const MenuItems: React.FC<MenuItemsProps> = ({ items, onItemDeleted, isSeller }) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { fetchCart } = useAppData();

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this menu item?");
    if (!confirm) return;

    try {
      setActionLoadingId(itemId);
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Menu item deleted");
      if (onItemDeleted) onItemDeleted();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete item");
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleAvailability = async (itemId: string) => {
    try {
      setActionLoadingId(itemId);
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message || "Status updated");
      if (onItemDeleted) onItemDeleted();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to add items to your cart");
        return;
      }

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        {
          restaurantId,
          itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message || "Added to cart!");
      if (fetchCart) fetchCart();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoadingItemId(null);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
          🍽️
        </div>
        <h3 className="text-base font-semibold text-gray-700">No menu items found</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          {isSeller
            ? "Your menu is currently empty. Click 'Add Item' to list your specialties."
            : "This restaurant hasn't added any dishes yet. Please check back later."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isCartLoading = loadingItemId === item._id;
        const isActionLoading = actionLoadingId === item._id;

        return (
          <div
            key={item._id}
            className={`group relative flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md ${
              !item.isAvailable ? "opacity-75 bg-gray-50/50" : ""
            }`}
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    !item.isAvailable ? "grayscale contrast-75" : ""
                  }`}
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <span className="rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white shadow">
                      Sold Out
                    </span>
                  </div>
                )}
                {item.category && (
                  <span className="absolute top-2 left-2 rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                    {item.category}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-gray-800 text-base line-clamp-1">{item.name}</h3>
                {item.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center text-red-600 font-bold text-base">
                <BiRupee size={18} />
                <span>{item.price}</span>
              </div>

              {isSeller ? (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={isActionLoading}
                    onClick={() => toggleAvailability(item._id)}
                    title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    className={`rounded-lg p-2 text-xs font-medium transition ${
                      item.isAvailable
                        ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                    }`}
                  >
                    {item.isAvailable ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                  </button>

                  <button
                    disabled={isActionLoading}
                    onClick={() => handleDelete(item._id)}
                    title="Delete Menu Item"
                    className="rounded-lg p-2 text-red-600 bg-red-50 hover:bg-red-100 transition"
                  >
                    <BiTrash size={16} />
                  </button>
                </div>
              ) : (
                <button
                  disabled={!item.isAvailable || isCartLoading}
                  onClick={() => addToCart(item.restaurantId, item._id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition ${
                    !item.isAvailable || isCartLoading
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-red-100"
                  }`}
                >
                  {isCartLoading ? (
                    <VscLoading size={15} className="animate-spin" />
                  ) : (
                    <>
                      <BsCartPlus size={15} />
                      <span>Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;
