import { createLazyFileRoute } from "@tanstack/react-router";
import Courses from "../components/courses";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Courses />
    </>
  );
}
