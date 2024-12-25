import { createLazyFileRoute } from "@tanstack/react-router";
import Login from "../login";

export const Route = createLazyFileRoute("/login")({
  component: About,
});

function About() {
  return (
    <>
      <Login />
    </>
  );
}
