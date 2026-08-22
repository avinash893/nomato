import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import OrderCard from "./OrderCard";
import { BiShoppingBag, BiCheckCircle, BiLoaderAlt, BiRefresh } from "react-icons/bi";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${restaurantService}/api/order/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to load restaurant orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Polling fallback for live orders
    return () => clearInterval(interval);
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
        <BiLoaderAlt className="animate-spin text-red-500" size={24} />
        <span>Loading live orders...</span>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">Incoming Orders</h3>
          <p className="text-xs text-gray-400">Accept and manage customer orders in real-time</p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer"
        >
          <BiRefresh size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Active Orders */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <BiShoppingBag size={18} />
          </div>
          <h4 className="text-sm font-bold text-gray-800">
            Active Orders ({activeOrders.length})
          </h4>
        </div>

        {activeOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50 text-xs text-gray-400">
            No active orders right now. New customer orders will appear here automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={fetchOrders}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Orders */}
      <div className="space-y-4 border-t border-gray-100 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BiCheckCircle size={18} />
          </div>
          <h4 className="text-sm font-bold text-gray-800">
            Completed / Delivered ({completedOrders.length})
          </h4>
        </div>

        {completedOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center bg-gray-50/50 text-xs text-gray-400">
            No completed orders yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={fetchOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;
