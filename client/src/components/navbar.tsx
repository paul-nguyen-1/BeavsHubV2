import { useState, useEffect, useRef } from "react";
import {
  Group,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import "../styles/navbar.css";
import { Link, useLocation } from "@tanstack/react-router";

export function Navbar() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
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
        <div onClick={closeDrawer}>{item.label}</div>
      </Link>
    </Box>
  ));

  return (
    <Box pb={64}>
      <header
        className={`fixed w-full z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-transform duration-500 ease-in-out ${
          hideNav ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="h-16 flex items-center justify-between max-w-4xl mx-auto w-full px-6">
          <Link to="/" className="no-underline">
            <span className="font-black text-xl text-gray-900">
              Beavs<span className="text-[#d73f09]">Hub</span>
            </span>
          </Link>

          <Box visibleFrom="sm">
            <Group
              gap={0}
              className="main-links"
              style={{ position: "relative" }}
            >
              {mainItems}
              <div className="underline" style={underlineStyle} />
            </Group>
          </Box>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
            size="sm"
          />
        </div>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="80%"
        padding="md"
        title={
          <Link to="/" className="no-underline" onClick={closeDrawer}>
            <span className="font-black text-lg text-gray-900">
              Beavs<span className="text-[#d73f09]">Hub</span>
            </span>
          </Link>
        }
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />
          {mainItems}
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
