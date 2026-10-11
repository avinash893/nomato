import React from "react";
import { useNavigate } from "react-router-dom";
import { BiMapPin, BiTimeFive } from "react-icons/bi";

interface RestaurantCardProps {
  id: string;
  image: string;
  name: string;
  distance: string | number;
  isOpen: boolean;
  description?: string;
  isVeg?: boolean;
  foodType?: "veg" | "non-veg" | "both";
  makingTime?: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  image,
  name,
  distance,
  isOpen,
  description,
  isVeg,
  foodType,
  makingTime = 25,
}) => {
  const navigate = useNavigate();

  const isPureVeg = isVeg === true || foodType === "veg";
  const isNonVeg = foodType === "non-veg";

  return (
    <div
      onClick={() => navigate(`/restaurant/${id}`)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-3 sm:p-4 shadow-sm border border-gray-100/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      <div>
        {/* Restaurant Image with Status Badge */}
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60"}
            alt={name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !isOpen ? "grayscale brightness-75" : ""
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-70 group-hover:opacity-50 transition-opacity" />

          {/* Top Status & Dietary Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm backdrop-blur-md ${
                isOpen
                  ? "bg-emerald-500/90 text-white"
                  : "bg-rose-500/90 text-white"
              }`}
            >
              {isOpen ? "Open" : "Closed"}
            </span>

            {isPureVeg && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm bg-emerald-600/95 text-white backdrop-blur-md flex items-center gap-1">
                <span>🌱</span> Pure Veg
              </span>
            )}
            {isNonVeg && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm bg-rose-600/95 text-white backdrop-blur-md flex items-center gap-1">
                <span>🍗</span> Non-Veg
              </span>
            )}
            {!isPureVeg && !isNonVeg && foodType === "both" && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm bg-amber-600/95 text-white backdrop-blur-md flex items-center gap-1">
                <span>🌱🍗</span> Veg & Non-Veg
              </span>
            )}
          </div>

          {/* Bottom Badges: Making Time & Distance */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-semibold">
              <BiTimeFive size={13} className="text-amber-300" />
              <span>{makingTime} min prep</span>
            </div>

            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-semibold">
              <BiMapPin size={13} className="text-red-400" />
              <span>{distance} km</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3.5 space-y-1">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="font-medium text-gray-500 flex items-center gap-1">
          <BiTimeFive size={14} className="text-gray-400" />
          <span>Prep time: {makingTime}m</span>
        </span>
        <span className="text-red-500 font-semibold group-hover:translate-x-0.5 transition-transform">
          View Menu →
        </span>
      </div>
    </div>
  );
};

export default RestaurantCard;
