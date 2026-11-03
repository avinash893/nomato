import React from "react";
import { Link } from "react-router-dom";
import { FaUtensils, FaMotorcycle, FaShieldAlt, FaLeaf, FaArrowRight } from "react-icons/fa";

const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-4 border border-red-100">
          Our Culinary Journey
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Food delivery built with <br />
          <span className="text-red-600">passion & precision.</span>
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed text-sm sm:text-base">
          Nomato connects hungry foodies with the best neighborhood kitchens and restaurants through microsecond-fast ordering, live GPS dispatch, and intelligent AI concierges.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
            <FaUtensils />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Curated Kitchens</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every dining partner undergoes quality checks, hygiene audits, and menu optimization for freshness and presentation.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
            <FaMotorcycle />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Sub-30 Min Dispatch</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Automated nearest-rider routing algorithms pair order readiness with rider location to minimize delivery wait times.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
            <FaShieldAlt />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Security & Privacy</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Protected by Cloudflare Edge proxy shielding, distributed Redis rate-limiting, and Razorpay 256-bit payment encryption.
          </p>
        </div>
      </div>

      {/* Mission Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-8 sm:p-12 rounded-3xl shadow-lg mb-14 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-black">Hungry for something delicious?</h2>
          <p className="text-red-100 text-sm">
            Explore hundreds of verified dishes, authentic street foods, and gourmet dining across your city.
          </p>
        </div>
        <Link
          to="/"
          className="px-6 py-3 bg-white text-red-600 font-bold rounded-2xl text-sm hover:bg-red-50 active:scale-95 transition shadow-sm flex items-center gap-2 shrink-0"
        >
          <span>Browse Restaurants</span>
          <FaArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default About;
