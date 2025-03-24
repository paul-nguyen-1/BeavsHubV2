import { useState, useRef, useEffect } from "react";
import { Box, Burger, Container, Group, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "@tanstack/react-router";
import headerIcon from "../../assets/header.svg";
import "./header.css";

const mainLinks = [
  { link: "/", label: "Home" },
  { link: "/courses", label: "Courses" },
  { link: "/planner", label: "Degree" },
  { link: "/resumes", label: "Resume" },
];

export function DoubleHeader() {
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure(false);
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({
    transform: "translateX(0px)",
    width: "0px",
  });

  const activeIndex = mainLinks.findIndex(
    (item) => item.link === location.pathname
  );

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
    >
      <Link to={item.link}>{item.label}</Link>
    </Box>
  ));

  return (
    <header className="header">
      <Container className="inner">
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
        <Burger
          opened={opened}
          onClick={toggle}
          className="burger"
          size="sm"
          hiddenFrom="sm"
        />
      </Container>
    </header>
  );
}
