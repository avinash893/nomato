import { useState } from "react";
import axios from "axios";
import { adminService } from "../config";
import toast from "react-hot-toast";
import { BiStore, BiPhone, BiMapPin, BiCheckCircle } from "react-icons/bi";

interface AdminRestaurantCardProps {
  restaurant: any;
  onVerify: () => void;
}

const AdminRestaurantCard: React.FC<AdminRestaurantCardProps> = ({
  restaurant,
  onVerify,
}) => {
  const [verifying, setVerifying] = useState(false);

  const verify = async () => {
    try {
      setVerifying(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${adminService}/api/v1/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`"${restaurant.name}" verified successfully!`);
      onVerify();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to verify restaurant");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition">
      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-gray-100">
        <img
          src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute top-3 right-3 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
          Pending Approval
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <BiStore size={18} />
          </div>
          <h3 className="text-base font-extrabold text-gray-900 line-clamp-1">
            {restaurant.name}
          </h3>
        </div>

        <div className="space-y-1 text-xs text-gray-500 pt-1">
          {restaurant.phone && (
            <p className="flex items-center gap-1.5 font-medium">
              <BiPhone size={14} className="text-gray-400" />
              <span>{restaurant.phone}</span>
            </p>
          )}

          <p className="flex items-start gap-1.5 line-clamp-2">
            <BiMapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
            <span>{restaurant.autoLocation?.formattedAddress || restaurant.address || "Address not provided"}</span>
          </p>
        </div>
      </div>

      <button
        disabled={verifying}
        onClick={verify}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
      >
        <BiCheckCircle size={18} />
        <span>{verifying ? "Approving..." : "Approve & Verify Kitchen"}</span>
      </button>
    </div>
  );
};

export default AdminRestaurantCard;
