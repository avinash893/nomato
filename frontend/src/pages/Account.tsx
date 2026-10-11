import { Toaster, toast } from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  BiLogOut,
  BiMapPin,
  BiStore,
  BiCycling,
  BiShoppingBag,
  BiCog,
} from "react-icons/bi";

const Account = () => {
  const { user, setIsAuth, setUser } = useAppData();

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "U";

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("demo_user");
    setIsAuth(false);
    setUser(null);

    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Toaster />

      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 p-6 bg-linear-to-b from-gray-50/70 to-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-2xl font-black text-white shadow-lg shadow-red-200">
            {firstLetter}
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900">
              {user?.name || "Nomato User"}
            </h2>
            <p className="text-xs text-gray-500">{user?.email || "user@nomato.com"}</p>
            <span className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">
              {user?.role || "Customer"} Account
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Hub Navigation */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Activity & Hubs
            </span>

            {user?.role === "seller" && (
              <button
                onClick={() => navigate("/restaurant")}
                className="w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-amber-500 text-white hover:bg-amber-600 transition font-bold text-xs cursor-pointer shadow-sm shadow-amber-200"
              >
                <div className="flex items-center gap-2.5">
                  <BiStore className="h-5 w-5" />
                  <span>Restaurant Kitchen Portal</span>
                </div>
                <span>→</span>
              </button>
            )}

            {user?.role === "rider" && (
              <button
                onClick={() => navigate("/rider")}
                className="w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition font-bold text-xs cursor-pointer shadow-sm shadow-emerald-200"
              >
                <div className="flex items-center gap-2.5">
                  <BiCycling className="h-5 w-5" />
                  <span>Delivery Rider Hub</span>
                </div>
                <span>→</span>
              </button>
            )}

            <button
              onClick={() => navigate("/orders")}
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100 transition font-semibold text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BiShoppingBag className="h-5 w-5 text-gray-400" />
                <span>Your Orders</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => navigate("/address")}
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100 transition font-semibold text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BiMapPin className="h-5 w-5 text-gray-400" />
                <span>Saved Delivery Addresses</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          {/* Dedicated Settings Section */}
          <div className="pt-2 border-t border-gray-100 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Settings & Preferences
            </span>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Current Account Role</span>
                  <span className="text-[11px] text-gray-500">
                    Customer, Restaurant Partner, or Rider
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-red-600 text-white uppercase shadow-xs">
                  {user?.role || "Customer"}
                </span>
              </div>

              <button
                onClick={() => navigate("/select-role")}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-xs transition font-bold text-xs cursor-pointer"
              >
                <BiCog size={16} className="text-gray-500" />
                <span>Switch / Configure Role</span>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logoutHandler}
            className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition font-bold text-xs cursor-pointer"
          >
            <BiLogOut className="h-4.5 w-4.5" />
            <span>Logout from Nomato</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
