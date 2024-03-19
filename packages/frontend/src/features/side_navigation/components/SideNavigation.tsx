import { Box, Divider, VStack } from "@chakra-ui/react";
import {
  IoBrowsers,
  IoCode,
  IoList,
  IoMusicalNote,
  IoSearch,
  IoServer,
} from "react-icons/io5";

import {
  ROUTE_HOME_BROWSER,
  ROUTE_HOME_FILE_EXPLORE,
  ROUTE_HOME_PLAYLIST,
  ROUTE_HOME_PLAY_QUEUE,
  ROUTE_HOME_PLUGIN,
  ROUTE_HOME_SEARCH,
} from "../../../const/routes";
import { CardStats } from "../../stats";
import { useSideNavigationItems } from "../hooks/useSideNavigationItems";

import {
  SideNavigationItem,
  SideNavigationItemProps,
} from "./SideNavigationItem";

export function SideNavigation() {
  const baseItems: SideNavigationItemProps[] = [
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
      name: "Plugins",
      icon: IoCode,
      link: ROUTE_HOME_PLUGIN,
    },
  ];

  const sideNavigationItems = useSideNavigationItems(baseItems);

  return (
    <>
      <VStack h="full">
        <Box w="100%" p={4}>
          {sideNavigationItems.map((item) => (
            <SideNavigationItem key={item.name} {...item}></SideNavigationItem>
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
