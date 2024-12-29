import { createLazyFileRoute } from "@tanstack/react-router";
import PlannerChart from "../components/reactFlow/plannerChart";

export const Route = createLazyFileRoute("/planner")({
  component: Planner,
});

function Planner() {
  return (
    <>
      <PlannerChart />
    </>
  );
}
