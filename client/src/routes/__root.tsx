import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Navbar } from "../components/navbar";

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <div className="underline"> hello</div>
      <div className="text-3xl font-bold underline text-lime-500">
        Debug Test
      </div>

      <div className="each h-screen"></div>
      <div className="each h-screen"></div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
