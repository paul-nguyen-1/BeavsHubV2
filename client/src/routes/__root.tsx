// routes/_root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Navbar } from "../components/navbar";
import { useEffect } from "react";
import { LinkedinLogo, EnvelopeSimple } from "@phosphor-icons/react";

const Footer = () => (
  <footer className="w-full border-t border-black/[0.06]">
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex flex-col items-center sm:items-start gap-0.5">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-900">
          Beavs<span className="text-[#d73f09]">Hub</span>
        </span>
        <span className="text-sm text-gray-400">
          Created by{" "}
          <span className="font-medium text-gray-600">Paul Nguyen</span>
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a
          href="https://www.linkedin.com/in/paul-nguyen-swe"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors"
        >
          <LinkedinLogo size={16} weight="regular" />
          LinkedIn
        </a>
        <a
          href="mailto:paul.nguyen.swe@gmail.com"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors"
        >
          <EnvelopeSimple size={16} weight="regular" />
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
    <div className="bg-white flex flex-col min-h-screen">
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
