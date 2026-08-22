import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../config";
import toast from "react-hot-toast";
import { BiRupee, BiCheckCircle, BiTime, BiPackage, BiCycling, BiShoppingBag } from "react-icons/bi";

interface OrderCardProps {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "placed":
      return { label: "New Order", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: BiTime };
    case "accepted":
      return { label: "Accepted", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: BiCheckCircle };
    case "preparing":
      return { label: "Kitchen Preparing", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: BiPackage };
    case "ready_for_rider":
      return { label: "Ready for Delivery", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: BiCycling };
    case "rider_assigned":
      return { label: "Rider Assigned", bg: "bg-sky-50 text-sky-700 border-sky-200", icon: BiCycling };
    case "picked_up":
      return { label: "Out for Delivery", bg: "bg-orange-50 text-orange-700 border-orange-200", icon: BiCycling };
    case "delivered":
      return { label: "Delivered", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: BiCheckCircle };
    default:
      return { label: status.replaceAll("_", " "), bg: "bg-gray-100 text-gray-700 border-gray-200", icon: BiShoppingBag };
  }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const actions = ORDER_ACTIONS[order.status] || [];
  const badge = statusBadge(order.status);
  const BadgeIcon = badge.icon;

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      const token = localStorage.getItem("token");
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Order marked as ${status.replaceAll("_", " ")}`);
      onStatusUpdate?.();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Order #{order._id.slice(-6).toUpperCase()}
          </span>
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
            {order.restaurantName || "Restaurant Order"}
          </h4>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}
        >
          <BadgeIcon size={14} />
          <span>{badge.label}</span>
        </span>
      </div>

      {/* Items list */}
      <div className="space-y-1 text-xs text-gray-600 bg-gray-50/60 p-3 rounded-2xl border border-gray-100">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-0.5">
            <span className="font-medium text-gray-800">
              {item.quauntity}x {item.name}
            </span>
            <span className="text-gray-500 font-semibold">₹{item.price * item.quauntity}</span>
          </div>
        ))}
      </div>

      {/* Delivery details & total */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
        <div className="text-gray-500">
          <p className="line-clamp-1 max-w-[200px]">{order.deliveryAddress?.fromattedAddress}</p>
          <p className="text-[11px] text-gray-400">Paid via {order.paymentMethod?.toUpperCase()}</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 font-medium block">Total Paid</span>
          <div className="flex items-center text-sm font-extrabold text-gray-900 justify-end">
            <BiRupee size={16} />
            <span>{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Status action buttons for Restaurant partner */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {actions.map((status) => (
            <button
              key={status}
              disabled={loading}
              onClick={() => updateStatus(status)}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Updating..." : `Mark as ${status.replaceAll("_", " ")}`}
            </button>
          ))}
        </div>
      )}

      {order.status === "ready_for_rider" && retryVisible && (
        <div className="pt-1">
          <button
            disabled={loading}
            className="w-full rounded-xl border border-red-500 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition cursor-pointer"
            onClick={() => updateStatus("ready_for_rider")}
          >
            Notify Delivery Partners Again
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
