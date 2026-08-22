import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, city, location } = useAppData();
  const currentLocation = useLocation();
  const isHomePage = currentLocation.pathname === "/";

  const [searchParam, setSearchParam] = useSearchParams();
  const [search, setSearch] = useState(searchParam.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParam({ search });
      } else {
        setSearchParam({});
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, setSearchParam]);

  return (
    <div className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-bold text-red-500 hover:text-red-600 transition"
          >
            Nomato
          </Link>

          {isHomePage && (
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 w-[580px]">
              <div
                className="flex items-center gap-2 pr-3 border-r border-gray-300 max-w-[260px]"
                title={location?.formattedAddress || city}
              >
                <BiMapPin className="text-red-500 text-xl flex-shrink-0" />
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Deliver to
                </span>
                <span className="text-sm font-medium text-gray-800 truncate">
                  {location?.formattedAddress || city}
                </span>
              </div>

              <div className="flex items-center flex-1 pl-3 gap-2">
                <BiSearch className="text-gray-500 text-xl" />

                <input
                  type="text"
                  placeholder="Search restaurants, food..."
                  className="w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {isAuth ? (
            <>
              <Link
                to="/cart"
                className="relative hover:scale-105 transition-transform"
              >
                <CgShoppingCart className="h-8 w-8 text-gray-700 hover:text-red-500" />

                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                  3
                </span>
              </Link>

              <Link
                to="/account"
                className="font-medium text-gray-700 hover:text-red-500 transition"
              >
                Account
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
