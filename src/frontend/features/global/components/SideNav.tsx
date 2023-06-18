"use client";
import { Box, Divider, Flex, Icon, Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { IconType } from "react-icons";
import {
  IoList,
  IoBrowsers,
  IoMusicalNote,
  IoServer,
  IoSearch,
  IoCode,
} from "react-icons/io5";

import { useSideNav } from "../hooks/useSideNav";

import CardStats from "./CardStats";

import {
  ROUTE_HOME_SEARCH,
  ROUTE_HOME_BROWSER,
  ROUTE_HOME_PLAYLIST,
  ROUTE_HOME_PLAY_QUEUE,
  ROUTE_HOME_FILE_EXPLORE,
  ROUTE_HOME_PLUGIN,
} from "@/const";

export type SideNavProps = {};

export default function SideNav(props: SideNavProps) {
  const baseItems: NavItemProps[] = [
    {
      name: "Play Queue",
      icon: IoMusicalNote,
      link: ROUTE_HOME_PLAY_QUEUE,
    },
    {
      name: "Browser",
      icon: IoBrowsers,
      link: ROUTE_HOME_BROWSER,
    },
    {
      name: "Playlist",
      icon: IoList,
      link: ROUTE_HOME_PLAYLIST,
    },
    {
      name: "Search",
      icon: IoSearch,
      link: ROUTE_HOME_SEARCH,
    },
    {
      name: "File Explore",
      icon: IoServer,
      link: ROUTE_HOME_FILE_EXPLORE,
    },
    {
      name: "Plugin",
      icon: IoCode,
      link: ROUTE_HOME_PLUGIN,
    },
  ];

  const { navItems } = useSideNav(baseItems);

  return (
    <>
      <VStack h="full">
        <Box w="100%" p={4}>
          {navItems.map((item) => (
            <NavItem key={item.name} {...item}></NavItem>
          ))}
        </Box>
        <Divider></Divider>
        <Box w="100%" h="full" p={0}>
          <CardStats></CardStats>
        </Box>
      </VStack>
    </>
  );
}

export type NavItemProps = {
  name: string;
  icon: IconType;
  link: string;
  isSelected?: boolean;
};

function NavItem(props: NavItemProps) {
  return (
    <Link as={NextLink} href={props.link} style={{ textDecoration: "none" }}>
      <Flex
        align="center"
        p="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={props.isSelected ? "brand.600" : undefined}
        color={props.isSelected ? "white" : undefined}
        _hover={{
          border: "solid 1px",
          borderColor: "brand.600",
        }}
      >
        <Icon as={props.icon} mr="4" fontSize="24"></Icon>
        <Text fontWeight={"medium"}>{props.name}</Text>
      </Flex>
    </Link>
  );
}
