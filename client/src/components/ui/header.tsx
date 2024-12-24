"use client";

import {
  Anchor,
  Burger,
  Container,
  ContainerProps,
  Flex,
  Group,
  MantineBreakpoint,
  MantineRadius,
  Text,
} from "@mantine/core";
import { motion } from "motion/react";
import classes from "./header.module.css";

export type HeaderLink = {
  label: string;
  href: string;
};

const HEADER_LINKS: HeaderLink[] = [
  { label: "Courses", href: "/" },
  { label: "Planner", href: "/planner" },
  { label: "Resumes", href: "/resumes" },
  { label: "BeavsAI", href: "/prompt" },
];

type Header01Props = ContainerProps & {
  /** Logo to display in the header */
  logo?: React.ReactNode;

  /** Links to display in the header */
  links?: HeaderLink[];

  /** Title for the call to action button */
  callToActionTitle?: string;

  /** URL for the call to action button */
  callToActionUrl?: string;

  /** Callback for when the menu is toggled */
  onMenuToggle?: () => void;

  /** Whether the menu is open */
  isMenuOpen?: boolean;

  /** Breakpoint at which the menu is displayed */
  breakpoint?: MantineBreakpoint;

  /** Border radius of the header */
  radius?: MantineRadius | number;
};

export const TitaniumHeader = ({
  style,
  breakpoint = "xs",
  logo = (
    <Text fw="bold" fz={24} mx="xs">
      BeavsHub
    </Text>
  ),
  callToActionTitle = "Login",
  callToActionUrl = "#",
  links = HEADER_LINKS,
  onMenuToggle,
  isMenuOpen,
  h = 60,
  radius = 30,
  ...containerProps
}: Header01Props) => (
  <Container
    className={classes.container}
    component="header"
    style={{ borderRadius: radius, ...style }}
    w={{ base: "100%", [breakpoint]: "fit-content" }}
    h={h}
    {...containerProps}
  >
    <Flex
      justify="space-between"
      align="center"
      h="100%"
      style={{ overflow: "hidden" }}
      gap="xs"
      wrap="nowrap"
    >
      <Group gap={0} style={{ flexShrink: 0 }}>
        <Burger
          size="sm"
          opened={isMenuOpen}
          onClick={onMenuToggle}
          hiddenFrom={breakpoint}
        />
        {logo}
      </Group>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: "fit-content", opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        viewport={{ once: true }}
      >
        <Flex
          flex={1}
          justify="center"
          px="lg"
          h="100%"
          align="center"
          wrap="nowrap"
          visibleFrom={breakpoint}
          gap="lg"
          className={classes["link-container"]}
        >
          {links.map((link) => (
            <Anchor
              key={link.href}
              className={classes.link}
              href={link.href}
              td="none"
            >
              {link.label}
            </Anchor>
          ))}
        </Flex>
      </motion.div>
      <Anchor
        href={callToActionUrl}
        className={classes.cta}
        style={{ flexShrink: 0, padding: "5px 20px" }}
      >
        {callToActionTitle}
      </Anchor>
    </Flex>
  </Container>
);
