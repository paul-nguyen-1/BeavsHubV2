import { createLazyFileRoute } from "@tanstack/react-router";
import Courses from "../components/courses";

export const Route = createLazyFileRoute("/courses")({
  component: Course,
});

function Course() {
  return (
    <>
      <Courses />
    </>
  );
}
