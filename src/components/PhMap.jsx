import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const PH_BOUNDS = [[4.5, 116.0], [21.5, 127.0]];

export default function PhMap() {
  return (
    <MapContainer
      center={[12.8, 122.5]}
      zoom={6}
      minZoom={5}
      maxBounds={PH_BOUNDS}
      maxBoundsViscosity={1}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
    </MapContainer>
  );
}