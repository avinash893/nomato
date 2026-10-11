import React from "react";
import { BiSliderAlt, BiX, BiReset, BiCheck, BiTimeFive, BiMapPin } from "react-icons/bi";

export interface FilterState {
  vegType: "all" | "veg" | "non-veg";
  maxDistance: number | null; // in km
  maxMakingTime: number | null; // in minutes
  sortBy: "default" | "distance" | "makingTime";
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalMatches: number;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  totalMatches,
}) => {
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setDraftFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultState: FilterState = {
      vegType: "all",
      maxDistance: null,
      maxMakingTime: null,
      sortBy: "default",
    };
    setDraftFilters(defaultState);
    onResetFilters();
  };

  const activeCount =
    (draftFilters.vegType !== "all" ? 1 : 0) +
    (draftFilters.maxDistance !== null ? 1 : 0) +
    (draftFilters.maxMakingTime !== null ? 1 : 0) +
    (draftFilters.sortBy !== "default" ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-all">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <BiSliderAlt size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Filter Restaurants
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Customize dietary preference, distance & making time
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
          >
            <BiX size={20} />
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">
          {/* Section 1: Veg / Non-Veg */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Dietary Preference (Veg / Non-Veg)</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "all", label: "All Foods", icon: "🍽️", desc: "All Menus" },
                { id: "veg", label: "Pure Veg", icon: "🌱", desc: "100% Veg" },
                { id: "non-veg", label: "Non-Veg", icon: "🍗", desc: "Meat & Poultry" },
              ].map((opt) => {
                const isSelected = draftFilters.vegType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        vegType: opt.id as any,
                      }))
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer relative ${
                      isSelected
                        ? "bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200/60"
                        : "bg-gray-50/60 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl mb-1">{opt.icon}</span>
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {opt.desc}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 text-red-600">
                        <BiCheck size={16} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Distance */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <BiMapPin className="text-red-500" size={14} />
              <span>Maximum Distance</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: null, label: "Any Distance", subtitle: "All Locations" },
                { value: 3, label: "< 3 km", subtitle: "Super Near" },
                { value: 5, label: "< 5 km", subtitle: "Neighborhood" },
                { value: 10, label: "< 10 km", subtitle: "Citywide" },
              ].map((distOpt) => {
                const isSelected = draftFilters.maxDistance === distOpt.value;
                return (
                  <button
                    key={distOpt.label}
                    type="button"
                    onClick={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        maxDistance: distOpt.value,
                      }))
                    }
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200/60"
                        : "bg-gray-50/60 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-xs font-bold">{distOpt.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {distOpt.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Making Time (Prep Time) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <BiTimeFive className="text-amber-500" size={14} />
              <span>Kitchen Making Time (Prep Time)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: null, label: "Any Time", subtitle: "All Kitchens" },
                { value: 20, label: "< 20 mins", subtitle: "⚡ Express" },
                { value: 30, label: "< 30 mins", subtitle: "⏱️ Standard" },
                { value: 45, label: "< 45 mins", subtitle: "🍲 Gourmet" },
              ].map((timeOpt) => {
                const isSelected = draftFilters.maxMakingTime === timeOpt.value;
                return (
                  <button
                    key={timeOpt.label}
                    type="button"
                    onClick={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        maxMakingTime: timeOpt.value,
                      }))
                    }
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-200/60"
                        : "bg-gray-50/60 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-xs font-bold">{timeOpt.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {timeOpt.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Sort Option */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Sort By
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "default", label: "Relevance" },
                { id: "distance", label: "📍 Closest First" },
                { id: "makingTime", label: "⚡ Fastest Making" },
              ].map((s) => {
                const isSelected = draftFilters.sortBy === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        sortBy: s.id as any,
                      }))
                    }
                    className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-gray-900 border-gray-900 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold transition cursor-pointer"
          >
            <BiReset size={16} />
            <span>Clear All</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-red-200 transition cursor-pointer"
          >
            <span>Apply Filters ({totalMatches} kitchens)</span>
            {activeCount > 0 && (
              <span className="bg-red-800 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {activeCount} active
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
