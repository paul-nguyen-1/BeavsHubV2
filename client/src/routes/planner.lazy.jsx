import { createLazyFileRoute } from "@tanstack/react-router";
import { LayoutFlowWithProvider } from "../components/reactFlow/layoutFlow";

export const Route = createLazyFileRoute("/planner")({
  component: Planner,
});

function Planner() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LayoutFlowWithProvider />
    </div>
  );
}
