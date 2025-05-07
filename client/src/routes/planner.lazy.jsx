import { createLazyFileRoute } from "@tanstack/react-router";
import { LayoutFlowWithProvider } from "../components/reactFlow/layoutFlow";
import background from "../assets/Beaver_background.png";

export const Route = createLazyFileRoute("/planner")({
  component: Planner,
});

function Planner() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <img
        src={background}
        alt="Background"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 object-contain"
        style={{ width: "600px", height: "auto" }}
      />

      <LayoutFlowWithProvider />
    </div>
  );
}
