import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { TitaniumHeader } from "../components/ui/header";

export const Route = createRootRoute({
  component: () => (
    <>
      <TitaniumHeader />
      <Outlet />
      {import.meta.env.VITE_API_BASE_URL.includes("localhost") && (
        <TanStackRouterDevtools />
      )}
    </>
  ),
});
