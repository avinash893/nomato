import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch, BiUser, BiReceipt } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, user, city, location, quauntity } = useAppData();
  const currentLocation = useLocation();
  const isHomePage = currentLocation.pathname === "/";

  const [searchParam, setSearchParam] = useSearchParams();
  const [search, setSearch] = useState(searchParam.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        setSearchParam({ search: search.trim() });
      } else if (search === "" && searchParam.get("search")) {
        setSearchParam({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, setSearchParam, searchParam]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section: Brand & Location */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-2xl font-black tracking-tight text-red-600 hover:text-red-700 transition flex items-center gap-1.5"
          >
            <span>🍅</span>
            <span>Nomato</span>
          </Link>

          {isHomePage && (
            <Link
              to="/address"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition max-w-[280px]"
              title={location?.formattedAddress || city}
            >
              <BiMapPin className="text-red-500 shrink-0" size={16} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Deliver To
                </span>
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {city || "Set delivery location"}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Center Search Bar (Desktop) */}
        {isHomePage && (
          <div className="hidden md:flex flex-1 max-w-md items-center bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2 focus-within:bg-white focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition">
            <BiSearch className="text-gray-400 mr-2 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Search dishes, restaurants, cuisines..."
              className="w-full bg-transparent outline-none text-xs text-gray-700 placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4 sm:gap-5">
          {isAuth ? (
            <>
              {user?.role === "customer" && (
                <>
                  <Link
                    to="/orders"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 transition"
                  >
                    <BiReceipt size={18} className="text-gray-500" />
                    <span className="hidden sm:inline">Orders</span>
                  </Link>

                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 transition"
                  >
                    <span className="hidden sm:inline">Admin</span>
                  </Link>

                  <Link
                    to="/cart"
                    className="relative flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50/50 transition"
                    title="Cart"
                  >
                    <CgShoppingCart size={22} />
                    {quauntity > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                        {quauntity}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <Link
                to="/account"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition text-xs font-bold text-gray-800"
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <BiUser size={16} className="text-gray-500" />
                )}
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-700 shadow-sm shadow-red-100 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
