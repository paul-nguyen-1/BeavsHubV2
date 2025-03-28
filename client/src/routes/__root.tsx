// routes/_root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Navbar } from "../components/navbar";
import { useEffect } from "react";

const RootComponent = () => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.classList.add("fade-out");
        setTimeout(() => preloader.remove(), 400);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Navbar />
      <Outlet />
      {import.meta.env.VITE_API_BASE_URL.includes("localhost") && (
        <TanStackRouterDevtools />
      )}
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
