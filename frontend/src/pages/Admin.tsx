import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../config";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import {
  BiShieldQuarter,
  BiStore,
  BiCycling,
  BiRefresh,
  BiLoaderAlt,
  BiCheckDouble,
} from "react-icons/bi";

const Admin = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [resRestaurants, resRiders] = await Promise.allSettled([
        axios.get(`${adminService}/api/v1/admin/restaurant/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${adminService}/api/v1/admin/rider/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resRestaurants.status === "fulfilled") {
        setRestaurants(resRestaurants.value.data.restaurants || []);
      }
      if (resRiders.status === "fulfilled") {
        setRiders(resRiders.value.data.riders || []);
      }
    } catch (error) {
      console.error("Admin data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <BiLoaderAlt className="animate-spin text-red-500" size={28} />
        <p className="text-sm font-medium text-gray-500">Loading admin operations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
            <BiShieldQuarter size={26} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-500">
              System Administration
            </span>
            <h1 className="text-2xl font-black text-gray-900">Partner Governance</h1>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <BiRefresh size={18} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-gray-100 p-1.5 max-w-md">
        <button
          onClick={() => setTab("restaurant")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === "restaurant"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <BiStore size={18} />
          <span>Pending Kitchens ({restaurants.length})</span>
        </button>

        <button
          onClick={() => setTab("rider")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === "rider"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <BiCycling size={18} />
          <span>Pending Riders ({riders.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {tab === "restaurant" && (
        <div className="space-y-4">
          {restaurants.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-dashed border-gray-200 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <BiCheckDouble size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-800">All Kitchens Verified</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                There are no restaurant partners awaiting verification at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurants.map((restaurant) => (
                <AdminRestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                  onVerify={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "rider" && (
        <div className="space-y-4">
          {riders.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-dashed border-gray-200 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <BiCheckDouble size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-800">All Delivery Partners Verified</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                There are no rider profiles awaiting verification at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {riders.map((rider) => (
                <RiderAdmin
                  key={rider._id}
                  rider={rider}
                  onVerify={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
