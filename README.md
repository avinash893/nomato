# 🍅 Nomato - Modern Full-Stack Food Delivery Platform

A scalable, full-stack food ordering and delivery web application built with a microservices architecture, React, TypeScript, Leaflet maps, and real-time WebSockets.

---

## 🌟 Key Features

### 🛒 Customer Experience
- **Interactive Restaurant Discovery**: Browse nearby restaurants with live location detection and cuisine category filters (Pizza, Burger, Biryani, Asian, Street Food, etc.).
- **Map-Based Address Selection**: Interactive Leaflet map with reverse geocoding to pinpoint delivery addresses.
- **Cart & Checkout**: Single-restaurant cart validation, subtotal calculation, delivery fee rules, and order summary.
- **Payment Options**: Razorpay payment gateway integration and Cash on Delivery (COD) support.
- **Live Order Tracking**: Real-time order progress stepper and live delivery partner vehicle tracking on a map.

### 🍳 Restaurant Partner Portal
- **Kitchen Profile & Status**: Manage restaurant profile photos, address, and live open/closed availability toggle.
- **Menu Catalog**: Add, edit, delete, and toggle in-stock/out-of-stock dish items with image uploads.
- **Incoming Orders Dashboard**: Real-time order reception with audio alerts, preparation status updates (`Accepted`, `Preparing`, `Ready for Delivery`).

### 🛵 Delivery Partner (Rider) System
- **KYC Onboarding**: Driver registration with Aadhaar number, Driving License verification, and photo uploads.
- **Online / Offline Switch**: Live GPS status broadcast to receive nearby delivery opportunities.
- **Trip Navigation**: Real-time route view between restaurant pickup and customer dropoff location.
- **Status Updates**: Step-by-step actions (`Reached Restaurant`, `Food Picked Up`, `Order Delivered`).

### 🛡️ Admin Governance
- **Verification Dashboard**: Approve and activate pending restaurant kitchens and driver registrations.

---

## 🏗️ Architecture & Microservices

The application is structured into modular microservices:

| Service | Port | Description |
|---|---|---|
| **`frontend`** | `5173` | React 19 + TypeScript + Vite + Tailwind CSS + Leaflet |
| **`services/auth`** | `5000` | Google OAuth authentication, JWT issuance & user profile management |
| **`services/restaurant`** | `5001` | Restaurant catalog, menus, address manager, cart system & order lifecycle |
| **`services/utils`** | `5002` | Cloudinary uploads, Nominatim reverse geocoding & Razorpay payments |
| **`services/rider`** | `5003` | Delivery partner profiles, active trip assignments & status updates |
| **`services/admin`** | `5004` | Admin approval workflows for kitchens and delivery riders |
| **`services/realtime`** | `5005` | Socket.IO server for instant order broadcasts and live vehicle GPS updates |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB database
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/avinash893/nomato.git
   cd nomato
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Install microservice dependencies**:
   ```bash
   cd ../services/auth && npm install
   cd ../restaurant && npm install
   cd ../utils && npm install
   cd ../rider && npm install
   cd ../admin && npm install
   cd ../realtime && npm install
   ```

4. **Start Development Servers**:
   - Start each service: `npm run dev` in respective directories.
   - Start frontend: `npm run dev` in `frontend/`.
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
This project is licensed under the ISC License.
