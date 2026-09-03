import { useState, useEffect, useRef } from "react";
import { Group, Box } from "@mantine/core";
import "../styles/navbar.css";
import { Link, useLocation } from "@tanstack/react-router";

export function Navbar() {
  const [hideNav, setHideNav] = useState(false);
  const location = useLocation();
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({
    transform: "translateX(0px)",
    width: "0px",
  });

  const mainLinks = [
    { link: "/", label: "Home" },
    { link: "/courses", label: "Courses" },
    { link: "/reviews", label: "Reviews" },
    { link: "/chart", label: "Chart" },
    { link: "/planner", label: "Degree" },
  ];

  const mobileLinks = [
    { link: "/courses", label: "Courses" },
    { link: "/reviews", label: "Reviews" },
  ];

  const activeIndex = mainLinks.findIndex(
    (item) => item.link === location.pathname
  );

  useEffect(() => {
    let lastVal = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > lastVal && y > 100) setHideNav(true);
      else if (y < lastVal) setHideNav(false);
      if (y === 0) setHideNav(false);
      lastVal = y;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const link = linksRef.current[activeIndex];
      if (link) {
        setUnderlineStyle({
          transform: `translateX(${link.offsetLeft}px)`,
          width: `${link.offsetWidth}px`,
        });
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [activeIndex]);

  const mainItems = mainLinks.map((item, index) => (
    <Box
      key={item.label}
      ref={(el) => (linksRef.current[index] = el)}
      className="main-link"
      data-active={index === activeIndex ? "true" : undefined}
      onClick={(e) => e.preventDefault()}
    >
      <Link to={item.link}>
        <div>{item.label}</div>
      </Link>
    </Box>
  ));

  const mobileItems = mobileLinks.map((item) => (
    <Box
      key={item.label}
      className="main-link"
      data-active={item.link === location.pathname ? "true" : undefined}
      onClick={(e) => e.preventDefault()}
    >
      <Link to={item.link}>
        <div>{item.label}</div>
      </Link>
    </Box>
  ));

  return (
    <Box>
      <header
        className={`fixed inset-x-0 top-0 z-[100] backdrop-blur-md backdrop-saturate-150 border-b border-black/[0.06] transition-transform duration-500 ease-in-out ${
          hideNav ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="h-14 flex items-center justify-between max-w-7xl mx-auto w-full px-6">
          <Link to="/" className="no-underline">
            <span className="font-bold text-[15px] tracking-tight text-gray-900">
              Beavs<span className="text-[#d73f09]">Hub</span>
            </span>
          </Link>

          <Box visibleFrom="sm">
            <Group
              gap={0}
              className="main-links"
              style={{ position: "relative" }}
            >
              <div className="pill-indicator" style={underlineStyle} />
              {mainItems}
            </Group>
          </Box>

          <Box hiddenFrom="sm">
            <Group gap={4}>{mobileItems}</Group>
          </Box>
        </div>
      </header>
    </Box>
  );
}
