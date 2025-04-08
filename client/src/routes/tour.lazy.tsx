import { createLazyFileRoute } from "@tanstack/react-router";
import Map from "../components/map";

export const Route = createLazyFileRoute("/tour")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex justify-center ">
      <Map />
    </div>
  );
}
