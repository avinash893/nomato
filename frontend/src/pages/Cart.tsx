import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICartItem, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../config";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus, BiMapPin, BiTrash, BiArrowBack, BiShoppingBag, BiRupee } from "react-icons/bi";

const Cart = () => {
  const { cart, subTotal, quauntity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl">
          <BiShoppingBag size={36} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
          Looks like you haven't added anything to your cart yet. Explore dishes from nearby kitchens!
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-200 hover:bg-red-700 transition cursor-pointer"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchCart();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update quantity");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchCart();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update quantity");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to empty your cart?");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await fetchCart();
      toast.success("Cart cleared");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear cart");
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-red-600 transition bg-white px-3.5 py-2 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
        >
          <BiArrowBack size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={clearCart}
          disabled={clearingCart}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition bg-white px-3.5 py-2 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
        >
          <BiTrash size={16} />
          <span>{clearingCart ? "Clearing..." : "Clear Cart"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Restaurant & Cart Items */}
        <div className="lg:col-span-7 space-y-4">
          {/* Restaurant Banner Card */}
          {restaurant && (
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                    Ordering From
                  </span>
                  {!restaurant.isOpen && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      Currently Closed
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-extrabold text-gray-900">{restaurant.name}</h2>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <BiMapPin className="text-red-400 shrink-0" size={14} />
                  <span className="truncate">
                    {restaurant.autoLocation?.formattedAddress || "Kitchen location"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-3">
            {cart.map((cartItem: ICartItem) => {
              const item = cartItem.itemId as IMenuItem;
              if (!item) return null;
              const isLoading = loadingItemId === item._id;

              return (
                <div
                  key={cartItem._id}
                  className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm border border-gray-100 transition hover:shadow-md"
                >
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300"}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <BiRupee size={14} />
                      <span>{item.price} each</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1 shrink-0">
                    <button
                      className="w-7 h-7 flex items-center justify-center rounded-xl bg-white text-gray-700 hover:bg-gray-100 shadow-xs transition disabled:opacity-40 cursor-pointer"
                      disabled={isLoading}
                      onClick={() => decreaseQty(item._id)}
                    >
                      {isLoading ? (
                        <VscLoading size={13} className="animate-spin text-red-500" />
                      ) : (
                        <BiMinus size={14} />
                      )}
                    </button>
                    <span className="font-bold text-xs px-1 text-gray-800">{cartItem.quauntity}</span>
                    <button
                      className="w-7 h-7 flex items-center justify-center rounded-xl bg-white text-gray-700 hover:bg-gray-100 shadow-xs transition disabled:opacity-40 cursor-pointer"
                      disabled={isLoading}
                      onClick={() => increaseQty(item._id)}
                    >
                      {isLoading ? (
                        <VscLoading size={13} className="animate-spin text-red-500" />
                      ) : (
                        <BiPlus size={14} />
                      )}
                    </button>
                  </div>

                  <div className="text-right font-extrabold text-sm text-gray-900 w-16 shrink-0 flex items-center justify-end">
                    <BiRupee size={15} />
                    <span>{item.price * cartItem.quauntity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Bill Details & Proceed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-4 sticky top-20">
            <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
              Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-bold text-gray-800">{quauntity} dishes</span>
              </div>

              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-bold text-gray-800">₹{subTotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className={deliveryFee === 0 ? "font-bold text-emerald-600" : "font-bold text-gray-800"}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-bold text-gray-800">₹{platformFee}</span>
              </div>
            </div>

            {subTotal < 250 && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-3 text-[11px] text-amber-800 font-medium leading-relaxed">
                Add items worth <span className="font-bold">₹{250 - subTotal}</span> more to unlock <span className="font-bold text-emerald-700">FREE Delivery</span>!
              </div>
            )}

            <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-100 pt-3">
              <span>To Pay</span>
              <span className="text-red-600">₹{grandTotal}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              disabled={restaurant && !restaurant.isOpen}
              className="w-full mt-2 rounded-2xl bg-red-600 py-4 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {restaurant && !restaurant.isOpen
                ? "Restaurant is Currently Closed"
                : "Proceed to Checkout →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
