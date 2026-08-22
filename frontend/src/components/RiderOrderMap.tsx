import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { realtimeService } from "../config";

const riderIcon = new L.DivIcon({
  html: `<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🛵</div>`,
  iconSize: [30, 30],
  className: "custom-leaflet-rider-icon",
});

const deliveryIcon = new L.DivIcon({
  html: `<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>`,
  iconSize: [30, 30],
  className: "custom-leaflet-drop-icon",
});

interface Props {
  order: IOrder;
}

const RiderOrderMap = ({ order }: Props) => {
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null
  );

  const deliveryLat = order.deliveryAddress?.latitude ?? 28.6139;
  const deliveryLng = order.deliveryAddress?.longitude ?? 77.209;
  const deliveryLocation: [number, number] = [deliveryLat, deliveryLng];

  useEffect(() => {
    const broadcastLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          setRiderLocation([latitude, longitude]);

          const internalKey = import.meta.env.VITE_INTERNAL_SERVICE_KEY || "internal_secret_key";
          axios
            .post(
              `${realtimeService}/api/v1/internal/emit`,
              {
                event: "rider:location",
                room: `user:${order.userId}`,
                payload: { latitude, longitude },
              },
              {
                headers: {
                  "x-internal-key": internalKey,
                },
              }
            )
            .catch(() => {});
        },
        () => {
          // Fallback location near customer drop
          setRiderLocation([deliveryLat + 0.005, deliveryLng + 0.005]);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
    };

    broadcastLocation();
    const interval = setInterval(broadcastLocation, 8000);
    return () => clearInterval(interval);
  }, [order.userId, deliveryLat, deliveryLng]);

  const currentCenter = riderLocation || deliveryLocation;

  return (
    <div className="rounded-3xl bg-white shadow-md border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-extrabold text-gray-800">
          Live Navigation Map
        </span>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          GPS Live Tracking
        </span>
      </div>

      <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-100 z-0">
        <MapContainer
          center={currentCenter}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {riderLocation && (
            <Marker position={riderLocation} icon={riderIcon}>
              <Popup>You (Delivery Partner)</Popup>
            </Marker>
          )}

          <Marker position={deliveryLocation} icon={deliveryIcon}>
            <Popup>Customer Drop Location</Popup>
          </Marker>

          {riderLocation && (
            <Polyline
              positions={[riderLocation, deliveryLocation]}
              color="#e23744"
              weight={4}
              dashArray="6, 8"
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default RiderOrderMap;
