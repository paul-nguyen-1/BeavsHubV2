import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

function MapWithStreetView() {
  const engineeringCenter: LatLngExpression = [44.567203, -123.2778659]; // Kelley Engineering Center Coordinates

  return (
    <div className="relative z-0 flex flex-row flex-wrap justify-center items-center gap-5 top-5 md:top-25">
      <MapContainer
        center={engineeringCenter}
        zoom={17}
        className="h-[300px] md:h-[400px] w-[300px] md:w-[400px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={engineeringCenter}>
          <Popup>Kelley Engineering Center, OSU</Popup>
        </Marker>
      </MapContainer>

      <iframe
        className="h-[300px] md:h-[400px] w-[300px] md:w-[400px] border-none"
        src="https://www.google.com/maps/embed?pb=!4v1744124154683!6m8!1m7!1sIznqdB7nX5ojc_5lTlQPyA!2m2!1d44.56720300653996!2d-123.2778658677774!3f271.4042892397883!4f3.105772573315704!5f0.7820865974627469"
        loading="lazy"
      ></iframe>
    </div>
  );
}

export default MapWithStreetView;
