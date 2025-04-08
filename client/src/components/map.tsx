import { GoogleMap, StreetViewPanorama } from "@react-google-maps/api";

function Map() {
  const containerStyle = {
    height: "600px",
    width: "800px",
  };
  const center = {
    lat: 44.5618,
    lng: -123.2823,
  };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      <StreetViewPanorama
        options={{
          position: center,
          visible: true,
        }}
      />
    </GoogleMap>
  );
}

export default Map;
