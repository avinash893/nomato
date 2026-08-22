import React, { useState } from "react";
import axios from "axios";
import { restaurantService } from "../config";
import toast from "react-hot-toast";
import { BiUpload, BiPlusCircle, BiRupee } from "react-icons/bi";

interface AddMenuItemProps {
  onItemAdded: () => void;
}

const AddMenuItem: React.FC<AddMenuItemProps> = ({ onItemAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Starters",
    "Main Course",
    "Beverages",
    "Desserts",
    "Fast Food",
    "Biryani",
    "Chinese",
    "Snacks",
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Main Course");
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !image) {
      toast.error("Name, price, and item image are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("category", category);
    formData.append("file", image);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(`${restaurantService}/api/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Menu item added successfully!");
      resetForm();
      onItemAdded();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to add menu item";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
          <BiPlusCircle size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Add New Dish</h2>
          <p className="text-xs text-gray-500">Add an exciting item to your restaurant menu</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Item Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Butter Chicken Masala, Margherita Pizza"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Price (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <BiRupee size={18} />
              </span>
              <input
                type="number"
                min="1"
                placeholder="250"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe flavors, ingredients, dietary flags..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Item Photo *
          </label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 group h-40">
              <img
                src={imagePreview}
                alt="Dish preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-2">
                <label className="cursor-pointer bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow hover:bg-gray-100">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 text-sm text-gray-500 hover:border-red-400 hover:bg-red-50/40 cursor-pointer transition">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <BiUpload size={22} />
              </div>
              <span className="font-medium text-gray-700">Click to upload dish photo</span>
              <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-xl text-white text-sm py-3.5 font-semibold transition bg-red-600 hover:bg-red-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-red-200 cursor-pointer"
        >
          {loading ? "Adding to Menu..." : "Add Item to Menu"}
        </button>
      </form>
    </div>
  );
};

export default AddMenuItem;
