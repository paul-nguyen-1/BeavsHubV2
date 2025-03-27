import { createFileRoute } from "@tanstack/react-router";
import Courses from "../components/courses";

export const Route = createFileRoute("/courses")({
  component: Course,
});

function Course() {
  return (
    <>
      <Courses />
    </>
  );
}
