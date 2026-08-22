import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

const riderIcon = new L.DivIcon({
  html: `<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🛵</div>`,
  iconSize: [30, 30],
  className: "custom-leaflet-rider-icon",
});

const deliveryIcon = new L.DivIcon({
  html: `<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🏠</div>`,
  iconSize: [30, 30],
  className: "custom-leaflet-drop-icon",
});

interface Props {
  riderLocation: [number, number];
  deliveryLocation: [number, number];
}

const UserOrderMap = ({ riderLocation, deliveryLocation }: Props) => {
  return (
    <div className="rounded-3xl bg-white shadow-md border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-extrabold text-gray-800">
          Live Delivery Partner Location
        </span>
        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 animate-pulse">
          Live Tracking
        </span>
      </div>

      <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-100 z-0">
        <MapContainer
          center={riderLocation}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={riderLocation} icon={riderIcon}>
            <Popup>Delivery Partner</Popup>
          </Marker>
          <Marker position={deliveryLocation} icon={deliveryIcon}>
            <Popup>Your Delivery Address</Popup>
          </Marker>
          <Polyline
            positions={[riderLocation, deliveryLocation]}
            color="#e23744"
            weight={4}
            dashArray="6, 8"
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default UserOrderMap;
