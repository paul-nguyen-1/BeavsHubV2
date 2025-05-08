import { createFileRoute } from "@tanstack/react-router";
import Courses from "../components/courses";
import background from "../assets/Beaver_background.png";

export const Route = createFileRoute("/courses")({
  component: Course,
});

function Course() {
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
