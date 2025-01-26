import { createLazyFileRoute } from "@tanstack/react-router";
import Resume from "../components/resume";

export const Route = createLazyFileRoute("/resumes")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Resume />
    </>
  );
}
