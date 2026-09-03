// routes/_root.tsx
import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Navbar } from "../components/navbar";
import { useEffect } from "react";
import { LinkedinLogo } from "@phosphor-icons/react";

const footerColumns = [
  {
    header: "Explore",
    links: [
      { label: "Courses", to: "/courses" },
      { label: "Reviews", to: "/reviews" },
      { label: "Difficulty chart", to: "/chart" },
      { label: "Degree path", to: "/planner" },
    ],
  },
  {
    header: "Program",
    links: [
      {
        label: "CS curriculum",
        href: "https://engineering.oregonstate.edu/EECS",
      },
      {
        label: "Course catalog",
        href: "https://catalog.oregonstate.edu/courses/cs/",
      },
      { label: "EECS department", href: "mailto:eecs@oregonstate.edu" },
    ],
  },
  {
    header: "Community",
    links: [
      { label: "Discord", href: "https://discord.gg/v5cFyqm4JY" },
      { label: "Write a review", to: "/courses" },
      { label: "Contact", href: "mailto:paul.nguyen.swe@gmail.com" },
    ],
  },
];

const Footer = () => (
  <footer className="w-full border-t border-black/[0.06] bg-white">
    <div className="max-w-7xl mx-auto px-6 py-14">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
        <div className="col-span-2 sm:col-span-1">
          <span className="text-base font-bold tracking-tight text-gray-900">
            Beavs<span className="text-[#d73f09]">Hub</span>
          </span>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-[220px]">
            Not affiliated with the university.
          </p>
          <a
            href="https://www.linkedin.com/in/paul-nguyen-swe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors mt-4"
          >
            <LinkedinLogo size={14} weight="regular" />
            Created by Paul Nguyen
          </a>
        </div>

        {footerColumns.map((column) => (
          <div key={column.header}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">
              {column.header}
            </p>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {column.links.map((item) => (
                <li key={item.label}>
                  {"to" in item ? (
                    <Link
                      to={item.to}
                      className="text-sm text-gray-600 hover:text-gray-900 no-underline transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      target={
                        item.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm text-gray-600 hover:text-gray-900 no-underline transition-colors"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </footer>
);

const RootComponent = () => {
  const location = useLocation();
  const hideFooter = location.pathname === "/planner";

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
      {!hideFooter && <Footer />}
      {import.meta.env.VITE_API_BASE_URL.includes("localhost") && (
        <TanStackRouterDevtools />
      )}
    </div>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
