import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { restaurantService } from "../config";
import {
  BiShoppingBag,
  BiCheckCircle,
  BiTime,
  BiPackage,
  BiCycling,
  BiRupee,
  BiChevronRight,
  BiLoaderAlt,
  BiRefresh,
} from "react-icons/bi";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const statusBadge = (status: string) => {
  switch (status) {
    case "placed":
      return { label: "Order Placed", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: BiTime };
    case "accepted":
      return { label: "Order Accepted", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: BiCheckCircle };
    case "preparing":
      return { label: "Preparing Meal", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: BiPackage };
    case "ready_for_rider":
      return { label: "Food Ready", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: BiPackage };
    case "rider_assigned":
      return { label: "Rider Heading to Kitchen", bg: "bg-sky-50 text-sky-700 border-sky-200", icon: BiCycling };
    case "picked_up":
      return { label: "Out for Delivery", bg: "bg-orange-50 text-orange-700 border-orange-200", icon: BiCycling };
    case "delivered":
      return { label: "Delivered", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: BiCheckCircle };
    default:
      return { label: status.replaceAll("_", " "), bg: "bg-gray-100 text-gray-700 border-gray-200", icon: BiShoppingBag };
  }
};

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(
        `${restaurantService}/api/order/myorder`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <BiLoaderAlt className="animate-spin text-red-500" size={28} />
        <p className="text-sm font-medium text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl">
          <BiShoppingBag size={36} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">No orders yet</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
          You haven't placed any food orders. Discover great kitchens nearby and order your favorites!
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-200 hover:bg-red-700 transition cursor-pointer"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Your Orders</h1>
          <p className="text-xs text-gray-400 mt-1">Live tracking and order history</p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition cursor-pointer"
        >
          <BiRefresh size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-base font-extrabold text-gray-900">
              Live & In-Progress ({activeOrders.length})
            </h2>
          </div>

          <div className="space-y-3">
            {activeOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed Orders Section */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-gray-900">
          Past Orders ({completedOrders.length})
        </h2>

        {completedOrders.length === 0 && activeOrders.length > 0 ? (
          <p className="text-xs text-gray-400">No completed orders yet.</p>
        ) : (
          <div className="space-y-3">
            {completedOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Orders;

const OrderRow = ({
  order,
  onClick,
}: {
  order: IOrder;
  onClick: () => void;
}) => {
  const badge = statusBadge(order.status);
  const BadgeIcon = badge.icon;

  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={onClick}
      className="group rounded-3xl bg-white p-5 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-red-100 transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition">
              {order.restaurantName || "Restaurant"}
            </h3>
            <span className="text-xs text-gray-400 font-medium">#{order._id.slice(-6).toUpperCase()}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{dateStr}</p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}
          >
            <BadgeIcon size={14} />
            <span>{badge.label}</span>
          </span>
          <BiChevronRight className="text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition" size={20} />
        </div>
      </div>

      <div className="text-xs text-gray-600 bg-gray-50/70 p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
        <span className="line-clamp-1 max-w-md">
          {order.items.map((item) => `${item.quauntity}x ${item.name}`).join(", ")}
        </span>
        <div className="flex items-center font-extrabold text-sm text-gray-900 shrink-0 ml-3">
          <BiRupee size={16} />
          <span>{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
};
