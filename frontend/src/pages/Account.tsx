import { Toaster, toast } from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Toaster />

      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-2xl font-bold text-white shadow-md shadow-red-200">
            {firstLetter}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {user?.name}
            </h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full capitalize">
              Role: {user?.role || "Customer"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 space-y-3">
          {user?.role === "seller" && (
            <button
              onClick={() => navigate("/restaurant")}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-amber-500 text-white hover:bg-amber-600 transition font-bold text-xs cursor-pointer shadow-sm shadow-amber-200"
            >
              <BiPackage className="h-5 w-5" />
              <span>Restaurant Kitchen Portal</span>
            </button>
          )}

          {user?.role === "rider" && (
            <button
              onClick={() => navigate("/rider")}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition font-bold text-xs cursor-pointer shadow-sm shadow-emerald-200"
            >
              <BiPackage className="h-5 w-5" />
              <span>Delivery Rider Hub</span>
            </button>
          )}

          <button
            onClick={() => navigate("/select-role")}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition font-bold text-xs cursor-pointer"
          >
            <BiPackage className="h-5 w-5" />
            <span>Switch Role (Current: {user?.role || "customer"})</span>
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-200 transition"
          >
            <BiPackage className="h-5 w-5" />
            <span>Your Orders</span>
          </button>

          <button
            onClick={() => navigate("/addresses")}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-200 transition"
          >
            <BiMapPin className="h-5 w-5" />
            <span>Your Addresses</span>
          </button>

          <button
            onClick={logoutHandler}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-red-500 text-white hover:bg-red-600 transition font-medium mt-4"
          >
            <BiLogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
