import { createLazyFileRoute } from "@tanstack/react-router";
import Map from "../components/map";
import { LoadScript } from "@react-google-maps/api";

export const Route = createLazyFileRoute("/tour")({
  component: RouteComponent,
});

function RouteComponent() {
  const key = ""; // api key
  return (
    <div className="pt-5 flex justify-center">
      <LoadScript googleMapsApiKey={key} libraries={["places"]}>
        <Map />
      </LoadScript>
    </div>
  );
}
