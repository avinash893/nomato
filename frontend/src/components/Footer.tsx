import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaEnvelope, FaHeadset, FaShieldAlt } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="text-3xl font-extrabold text-red-500 tracking-tight">
              Nomato
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your favorite food delivered hot & fresh to your doorstep. Experience the best dining & delivery across your city.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Made with</span>
              <FaHeart className="text-red-500" />
              <span>for food lovers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-red-400 transition">
                  Browse Restaurants
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-red-400 transition">
                  Your Orders
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-red-400 transition">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/select-role" className="hover:text-red-400 transition">
                  Switch Role (Partner / Rider)
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner & Sellers */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              For Partners
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/restaurant" className="hover:text-red-400 transition">
                  Restaurant Dashboard
                </Link>
              </li>
              <li>
                <Link to="/add-restaurant" className="hover:text-red-400 transition">
                  List Your Restaurant
                </Link>
              </li>
              <li>
                <Link to="/rider" className="hover:text-red-400 transition">
                  Rider Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-red-400 transition">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Support & Help
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/support" className="flex items-center gap-2 hover:text-red-400 transition">
                  <FaHeadset className="text-red-400" />
                  <span>Help & Support Center</span>
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support.wehear@gmail.com"
                  className="flex items-center gap-2 hover:text-red-400 transition text-gray-300"
                >
                  <FaEnvelope className="text-red-400" />
                  <span className="break-all">support.wehear@gmail.com</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                <FaShieldAlt className="text-emerald-400" />
                <span>24/7 Priority Customer Care</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Nomato Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/support" className="hover:text-gray-400 transition">
              Contact Us
            </Link>
            <Link to="/support" className="hover:text-gray-400 transition">
              Privacy Policy
            </Link>
            <Link to="/support" className="hover:text-gray-400 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
