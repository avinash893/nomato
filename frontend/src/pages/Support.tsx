import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaEnvelope,
  FaHeadset,
  FaQuestionCircle,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";

const Support: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    // Simulate sending message to support.wehear@gmail.com
    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        "Message received! Our team at support.wehear@gmail.com will get back to you shortly."
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 600);
  };

  const faqs = [
    {
      q: "How can I track my live order?",
      a: "Once you place an order, navigate to Your Orders and click on your active order. You'll see real-time updates and live map tracking for your delivery rider.",
    },
    {
      q: "What is your refund policy?",
      a: "If an item is missing or delivered incorrectly, reach out to our team at support.wehear@gmail.com within 24 hours of delivery. Refunds are processed within 2-4 business days.",
    },
    {
      q: "How do I become a restaurant seller or rider?",
      a: "Head over to 'Switch Role' from your account dropdown, choose 'Seller' or 'Rider', and complete your onboarding in minutes.",
    },
    {
      q: "How can I use the Nomato AI Assistant?",
      a: "Click on the floating red bubble at the bottom-right corner of any page. Ask for food suggestions, diet-specific recommendations, or quick order help!",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
            <FaHeadset /> 24/7 Dedicated Support
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            Have questions about an order, restaurant partnership, or rider delivery? We're here around the clock.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl">
              <FaEnvelope />
            </div>
            <h3 className="font-bold text-gray-900">Email Us</h3>
            <p className="text-xs text-gray-500">Fast replies within 2 hours</p>
            <a
              href="mailto:support.wehear@gmail.com"
              className="text-sm font-semibold text-red-600 hover:text-red-700 break-all"
            >
              support.wehear@gmail.com
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
              <FaClock />
            </div>
            <h3 className="font-bold text-gray-900">Operating Hours</h3>
            <p className="text-xs text-gray-500">Live order support</p>
            <span className="text-sm font-semibold text-gray-800">
              Monday – Sunday (24 Hours)
            </span>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
              <FaMapMarkerAlt />
            </div>
            <h3 className="font-bold text-gray-900">Headquarters</h3>
            <p className="text-xs text-gray-500">Nomato Technologies</p>
            <span className="text-sm font-semibold text-gray-800">
              Bangalore & Delhi NCR, India
            </span>
          </div>
        </div>

        {/* Main Form & FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Send Message Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
              <p className="text-sm text-gray-500">
                Directly connects to <span className="font-medium text-gray-700">support.wehear@gmail.com</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Order #123 issue, Partner query"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help you..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-[0.99] text-white py-3 rounded-xl font-semibold text-sm transition shadow-md disabled:opacity-50"
              >
                <FaPaperPlane className="text-xs" />
                <span>{submitting ? "Sending..." : "Submit Inquiry"}</span>
              </button>
            </form>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2">
              <FaQuestionCircle className="text-red-500 text-xl" />
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
                  <h4 className="font-semibold text-sm text-gray-900 mb-1.5">{faq.q}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
