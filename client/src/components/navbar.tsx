import { useState, useEffect, useRef } from "react";
import {
  Group,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
  Image,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import "../styles/navbar.css";
import { Link, useLocation } from "@tanstack/react-router";
import headerIcon from "../assets/header.svg";

export function Navbar() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [heightState, setHeightState] = useState("pageTop");
  const location = useLocation();
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({
    transform: "translateX(0px)",
    width: "0px",
  });

  const mainLinks = [
    { link: "/", label: "Home" },
    { link: "/courses", label: "Courses" },
    { link: "/planner", label: "Degree" },
    { link: "/resumes", label: "Resume" },
    { link: "/about", label: "About" },
  ];

  const activeIndex = mainLinks.findIndex(
    (item) => item.link === location.pathname
  );

  useEffect(() => {
    let lastVal = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > lastVal && y > 100) {
        setHeightState("scrollDown");
      } else if (y < lastVal) {
        setHeightState("scrollUp");
      }
      if (y === 0) {
        setHeightState("pageTop");
      }
      lastVal = y;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
      onClick={(event) => {
        event.preventDefault();
      }}
    >
      <Link to={item.link}>
        <div onClick={closeDrawer}>{item.label}</div>
      </Link>
    </Box>
  ));

  return (
    <Box pb={40}>
      <header
        className={`header fixed w-full z-[10] transition-transform duration-700 ease-in-out ${
          heightState === "scrollDown" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="h-[50px] flex flex-wrap justify-between px-5">
          <div className="flex flex-wrap md:justify-evenly md:w-full">
            <Link to="/">
              <Image src={headerIcon} className="icon" />
            </Link>
            <Box className="links" visibleFrom="sm">
              <Group
                gap={0}
                justify="flex-end"
                className="main-links"
                style={{ position: "relative" }}
              >
                {mainItems}
                <div className="underline" style={underlineStyle}></div>
              </Group>
            </Box>
            <div></div>
          </div>
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
            className="relative top-2"
          />
        </div>
      </header>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="80%"
        padding="md"
        title={
          <Link to="/">
            <Image src={headerIcon} className="icon" onClick={closeDrawer} />
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
