import { Box, Divider, VStack } from "@chakra-ui/react";
import {
  IoBrowsers,
  IoCode,
  IoList,
  IoMusicalNote,
  IoSearch,
  IoServer,
  IoText,
} from "react-icons/io5";

import {
  ROUTE_HOME_BROWSER,
  ROUTE_HOME_FILE_EXPLORE,
  ROUTE_HOME_FULL_TEXT_SEARCH,
  ROUTE_HOME_PLAYLIST,
  ROUTE_HOME_PLAY_QUEUE,
  ROUTE_HOME_PLUGIN,
  ROUTE_HOME_SEARCH,
} from "../../../const/routes";
import { Metrics } from "../../metrics";
import { CardStats } from "../../stats";
import { useSideNavigationItems } from "../hooks/useSideNavigationItems";

import {
  SideNavigationItem,
  SideNavigationItemProps,
} from "./SideNavigationItem";

export function SideNavigation({ isCompact }: { isCompact: boolean }) {
  const baseItems: SideNavigationItemProps[] = [
    {
      name: "Play Queue",
      icon: IoMusicalNote,
      link: ROUTE_HOME_PLAY_QUEUE,
      isCompact,
    },
    {
      name: "Browser",
      icon: IoBrowsers,
      link: ROUTE_HOME_BROWSER,
      isCompact,
    },
    {
      name: "Playlist",
      icon: IoList,
      link: ROUTE_HOME_PLAYLIST,
      isCompact,
    },
    {
      name: "Search",
      icon: IoSearch,
      link: ROUTE_HOME_SEARCH,
      isCompact,
    },
    {
      name: "File Explore",
      icon: IoServer,
      link: ROUTE_HOME_FILE_EXPLORE,
      isCompact,
    },
    {
      name: "Full-Text Search",
      icon: IoText,
      link: ROUTE_HOME_FULL_TEXT_SEARCH,
      isCompact,
    },
    {
      name: "Plugins",
      icon: IoCode,
      link: ROUTE_HOME_PLUGIN,
      isCompact,
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
        {isCompact ? null : (
          <>
            <Divider />
            <Box w="100%" h="full" pb={0} px={6} pt={2}>
              <CardStats />
            </Box>
            <Divider />
            <Box w="100%" h="full" pb={0} px={6} pt={2}>
              <Metrics />
            </Box>
          </>
        )}
      </VStack>
    </>
  );
}
