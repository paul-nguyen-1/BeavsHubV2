import { createFileRoute } from "@tanstack/react-router";
import background from "../assets/Beaver_background.png";
import Courses from "../components/courses";

export const Route = createFileRoute("/reviews")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <img
        src={background}
        alt="Background"
        className="hidden md:inline fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-2 object-contain"
        style={{ width: "600px", height: "auto" }}
      />
      <Courses />
    </>
  );
}
