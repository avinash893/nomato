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
    setIsAuth(false);
    setUser(null);

    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Toaster />

      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-2xl font-bold text-white">
            {firstLetter}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {user?.name}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 space-y-3">
          <button
            onClick={() => navigate("/orders")}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 hover:bg-red-600 transition"
          >
            <BiPackage className="h-5 w-5" />
            <span>Your Orders</span>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <button
            onClick={() => navigate("/Adresses")}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 hover:bg-red-600 transition"
          >
            <BiMapPin className="h-5 w-5" />
            <span>Your Addresses</span>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <button
            onClick={logoutHandler}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 hover:bg-red-600 transition"
          >
            <BiLogOut className="h-5 w-5 " />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
