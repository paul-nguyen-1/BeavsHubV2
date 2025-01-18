import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/planner")({
  component: Planner,
});

function Planner() {
  return (
    <>
    test
    </>
  );
}
