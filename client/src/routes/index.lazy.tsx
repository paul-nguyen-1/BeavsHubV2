import { createLazyFileRoute } from "@tanstack/react-router";
// import Courses from "../components/courses";
import Login from "../login";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Login />
      {/* <Courses /> */}
    </>
  );
}
