import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../config";
import toast from "react-hot-toast";
import {
  BiPhoneCall,
  BiStore,
  BiMapPin,
  BiRupee,
  BiCycling,
  BiCheckCircle,
  BiPackage,
} from "react-icons/bi";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const updateStatus = async (status?: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Delivery status updated!");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="rounded-3xl bg-white shadow-md border border-gray-100 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
            Active Order
          </span>
          <h2 className="text-base font-extrabold text-gray-900">
            #{order._id.slice(-6).toUpperCase()}
          </h2>
        </div>

        <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-600 capitalize flex items-center gap-1.5">
          <BiCycling size={16} />
          <span>{order.status.replaceAll("_", " ")}</span>
        </span>
      </div>

      {/* Pickup and Drop cards */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50/60 p-3.5 border border-amber-100">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BiStore size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
              Pickup Point
            </span>
            <p className="text-xs font-bold text-gray-900">{order.restaurantName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/60 p-3.5 border border-emerald-100">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <BiMapPin size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Customer Drop
            </span>
            <p className="text-xs font-medium text-gray-800 leading-snug">
              {order.deliveryAddress?.fromattedAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Earnings & Bill */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 block">Your Earning</span>
          <div className="flex items-center text-base font-black text-emerald-600">
            <BiRupee size={18} />
            <span>{order.riderAmount}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100 text-right">
          <span className="text-[10px] font-bold text-gray-400 block">Order Total</span>
          <div className="flex items-center justify-end text-base font-black text-gray-900">
            <BiRupee size={18} />
            <span>{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Customer Contact */}
      {order.deliveryAddress?.mobile && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Customer Contact
            </p>
            <p className="text-xs font-extrabold text-gray-800">
              {order.deliveryAddress.mobile}
            </p>
          </div>
          <a
            href={`tel:${order.deliveryAddress.mobile}`}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            <BiPhoneCall size={16} />
            <span>Call</span>
          </a>
        </div>
      )}

      {/* Status Progress Button */}
      <div className="pt-2">
        {order.status === "rider_assigned" && (
          <button
            onClick={() => updateStatus("picked_up")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-xs font-bold text-white shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-[0.99] transition cursor-pointer"
          >
            <BiPackage size={18} />
            <span>Food Picked Up from Kitchen</span>
          </button>
        )}

        {order.status === "picked_up" && (
          <button
            onClick={() => updateStatus("delivered")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.99] transition cursor-pointer"
          >
            <BiCheckCircle size={18} />
            <span>Mark Order as Delivered</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
