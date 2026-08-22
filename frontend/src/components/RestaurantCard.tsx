import React from "react";
import { useNavigate } from "react-router-dom";
import { BiMapPin } from "react-icons/bi";

interface RestaurantCardProps {
  id: string;
  image: string;
  name: string;
  distance: string | number;
  isOpen: boolean;
  description?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  image,
  name,
  distance,
  isOpen,
  description,
}) => {
  const navigate = useNavigate();

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm backdrop-blur-md ${
                isOpen
                  ? "bg-emerald-500/90 text-white"
                  : "bg-rose-500/90 text-white"
              }`}
            >
              {isOpen ? "Open Now" : "Closed"}
            </span>
          </div>

          {/* Distance Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-semibold">
            <BiMapPin size={13} className="text-red-400" />
            <span>{distance} km</span>
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
        <span className="font-medium text-gray-500">Fast Delivery</span>
        <span className="text-red-500 font-semibold group-hover:translate-x-0.5 transition-transform">
          View Menu →
        </span>
      </div>
    </div>
  );
};

export default RestaurantCard;
