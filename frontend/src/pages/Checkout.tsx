import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../config";
import { useNavigate, Link } from "react-router-dom";
import type { ICartItem, IMenuItem, IRestaurant, IAddress } from "../types";
import toast from "react-hot-toast";
import {
  BiCreditCard,
  BiLoaderAlt,
  BiPlusCircle,
  BiMapPin,
  BiMoney,
  BiArrowBack,
  BiCheckCircle,
} from "react-icons/bi";

const Checkout = () => {
  const { cart, subTotal, quauntity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAddresses(data || []);
        if (data && data.length > 0) {
          setSelectedAddressId(data[0]._id);
        }
      } catch (error) {
        console.error("Failed to load addresses:", error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [cart]);

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-xs text-gray-500">Add dishes before proceeding to checkout</p>
        <Link
          to="/"
          className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow hover:bg-red-700"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (method: "razorpay" | "cod") => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return null;
    }

    setCreatingOrder(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod: method,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create order");
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePayRazorpay = async () => {
    try {
      setProcessingPayment(true);
      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      // Request payment credentials from utils service
      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Nomato",
        description: `Order #${orderId.slice(-6).toUpperCase()} Payment`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment successful! Order placed 🎉");
            if (fetchCart) await fetchCart();
            navigate(`/paymentsuccess/${response.razorpay_payment_id}`);
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#E23744",
        },
      };

      if ((window as any).Razorpay) {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // Mock fallback / script loader
        toast.error("Razorpay SDK not loaded. Simulating order placement...");
        if (fetchCart) await fetchCart();
        navigate(`/order/${orderId}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Payment initiation failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePlaceCOD = async () => {
    try {
      setProcessingPayment(true);
      const order = await createOrder("cod");
      if (!order) return;

      toast.success("Order placed successfully with Cash on Delivery! 🎉");
      if (fetchCart) await fetchCart();
      navigate(`/order/${order.orderId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to place COD order");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmitPayment = () => {
    if (paymentMethod === "razorpay") {
      handlePayRazorpay();
    } else {
      handlePlaceCOD();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-6 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/cart")}
        className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-red-600 transition bg-white px-3.5 py-2 rounded-xl shadow-sm border border-gray-100 cursor-pointer"
      >
        <BiArrowBack size={16} />
        <span>Back to Cart</span>
      </button>

      <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Checkout & Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Address Selection & Payment Methods */}
        <div className="lg:col-span-7 space-y-5">
          {/* Restaurant Details */}
          {restaurant && (
            <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                  Fulfilling Kitchen
                </span>
                <h2 className="text-lg font-extrabold text-gray-900 mt-1">{restaurant.name}</h2>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <BiMapPin className="text-red-400 shrink-0" size={14} />
                  <span className="truncate">
                    {restaurant.autoLocation?.formattedAddress || "Kitchen location"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Delivery Address</h3>
                <p className="text-xs text-gray-400">Select where your order should be delivered</p>
              </div>
              <Link
                to="/address"
                className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition"
              >
                <BiPlusCircle size={15} />
                <span>Add New</span>
              </Link>
            </div>

            {loadingAddress ? (
              <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                <BiLoaderAlt className="animate-spin text-red-500" size={20} />
                <span>Loading your addresses...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200">
                <p className="text-xs text-gray-500 mb-2">No saved addresses found</p>
                <Link
                  to="/address"
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow hover:bg-red-700"
                >
                  Add Delivery Address
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <label
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? "border-red-500 bg-red-50/40 shadow-xs"
                          : "border-gray-100 bg-gray-50/60 hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="mt-1 text-red-600 focus:ring-red-500"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px] font-black uppercase">
                            {addr.label || "Home"}
                          </span>
                          <span className="text-xs text-gray-600 font-semibold">
                            📞 {addr.mobile}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 font-medium leading-relaxed">
                          {addr.formattedAddress}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-base font-extrabold text-gray-900">Payment Option</h3>

            <div className="space-y-2.5">
              <label
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer ${
                  paymentMethod === "razorpay"
                    ? "border-blue-500 bg-blue-50/40"
                    : "border-gray-100 bg-gray-50/50 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <BiCreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                      Razorpay (UPI, Google Pay, Cards, NetBanking)
                    </h4>
                    <p className="text-[11px] text-gray-500">Secure instant payments with 100% buyer protection</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="text-blue-600"
                />
              </label>

              <label
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer ${
                  paymentMethod === "cod"
                    ? "border-emerald-500 bg-emerald-50/40"
                    : "border-gray-100 bg-gray-50/50 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <BiMoney size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">Cash on Delivery (COD)</h4>
                    <p className="text-[11px] text-gray-500">Pay directly to our delivery partner when receiving</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="text-emerald-600"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-4 sticky top-20">
            <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
              Order Summary ({quauntity} items)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((cartItem: ICartItem) => {
                const item = cartItem.itemId as IMenuItem;
                if (!item) return null;

                return (
                  <div key={cartItem._id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-[10px]">
                        {cartItem.quauntity}x
                      </span>
                      <span className="font-semibold text-gray-800 line-clamp-1 max-w-[170px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{item.price * cartItem.quauntity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-bold text-gray-800">₹{subTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className={deliveryFee === 0 ? "font-bold text-emerald-600" : "font-bold text-gray-800"}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-bold text-gray-800">₹{platformFee}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-100 pt-3">
              <span>Grand Total</span>
              <span className="text-red-600">₹{grandTotal}</span>
            </div>

            <button
              onClick={handleSubmitPayment}
              disabled={!selectedAddressId || processingPayment || creatingOrder}
              className="w-full mt-3 rounded-2xl bg-red-600 py-4 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {processingPayment || creatingOrder ? (
                <>
                  <BiLoaderAlt className="animate-spin" size={18} />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <BiCheckCircle size={18} />
                  <span>
                    {paymentMethod === "razorpay" ? `Pay ₹${grandTotal} via Razorpay` : `Place COD Order (₹${grandTotal})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
