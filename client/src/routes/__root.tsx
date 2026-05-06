// routes/_root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Navbar } from "../components/navbar";
import { useEffect } from "react";
import { LinkedinLogo, EnvelopeSimple } from "@phosphor-icons/react";

const Footer = () => (
  <footer className="w-full bg-gray-50 border-t border-gray-200">
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex flex-col items-center sm:items-start gap-0.5">
        <span className="text-xs font-bold uppercase tracking-widest text-[#d73f09]">
          BeavsHub
        </span>
        <span className="text-sm text-gray-500">
          Created by{" "}
          <span className="font-semibold text-gray-900">Paul Nguyen</span>
        </span>
      </div>
      <div className="flex items-center gap-5">
        <a
          href="https://www.linkedin.com/in/paul-nguyen-swe"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#d73f09] transition-colors"
        >
          <LinkedinLogo size={17} weight="fill" />
          LinkedIn
        </a>
        <a
          href="mailto:paul.nguyen.swe@gmail.com"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#d73f09] transition-colors"
        >
          <EnvelopeSimple size={17} weight="fill" />
          Contact
        </a>
      </div>
    </div>
  </footer>
);

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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />
      {import.meta.env.VITE_API_BASE_URL.includes("localhost") && (
        <TanStackRouterDevtools />
      )}
    </div>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
