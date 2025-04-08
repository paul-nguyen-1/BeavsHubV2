import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

function Map() {
  const center: LatLngExpression = [44.5618, -123.2823];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "600px", width: "800px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>
          You are here! <br /> OSU Campus.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;
