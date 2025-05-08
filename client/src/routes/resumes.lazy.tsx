import { createLazyFileRoute } from "@tanstack/react-router";
import Resume from "../components/resume";
import background from "../assets/Beaver_background.png";

export const Route = createLazyFileRoute("/resumes")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <img
        src={background}
        alt="Background"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-2 object-contain"
        style={{ width: "600px", height: "auto" }}
      />
      <Resume />
    </>
  );
}
