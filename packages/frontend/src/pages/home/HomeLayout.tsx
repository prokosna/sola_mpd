import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import Div100vh from "react-div-100vh";
import { IoMenu } from "react-icons/io5";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { ROUTE_HOME, ROUTE_HOME_PLAY_QUEUE } from "../../const/routes";
import { GlobalFilterBox } from "../../features/global_filter";
import { useGlobalKeyShortcuts } from "../../features/keyboard_shortcut";
import { BrandLogo } from "../../features/logo";
import { MpdEventObserver } from "../../features/mpd";
import { Player } from "../../features/player";
import {
  PluginExecutionIndicator,
  PluginExecutionModal,
} from "../../features/plugin";
import { MpdProfileSelector } from "../../features/profile";
import {
  ColorModeSwitchButton,
  SettingsEntryButton,
} from "../../features/settings";
import { SideNavigation } from "../../features/side_navigation";

export function HomeLayout() {
  useGlobalKeyShortcuts();
  const location = useLocation();
  const navigate = useNavigate();
  const { getButtonProps, isOpen } = useDisclosure({
    defaultIsOpen: true,
  });

  useEffect(() => {
    if (location.pathname === ROUTE_HOME) {
      navigate(ROUTE_HOME_PLAY_QUEUE);
    }
  }, [location, navigate]);

  return (
    <>
      <Div100vh>
        <Grid
          templateAreas={`"header"
      "main"
      "footer"`}
          gridTemplateRows={"80px 1fr 100px"}
          gap="0px"
        >
          <GridItem area={"header"}>
            <HStack spacing={"0px"}>
              <Box minW="250px" h="80px">
                <HStack h="100%" justify={"space-between"} align={"center"}>
                  <BrandLogo></BrandLogo>
                  <Button
                    {...getButtonProps()}
                    p={0}
                    ml={0}
                    mr={2}
                    variant={"ghost"}
                    flexGrow={1}
                  >
                    <Icon as={IoMenu} fontSize={24} />
                  </Button>
                </HStack>
              </Box>
              <Box flexGrow={"1"}>
                <HStack h="100%" justify={"space-between"} align={"center"}>
                  <GlobalFilterBox></GlobalFilterBox>
                  <HStack h="100%" justify={"end"} align={"center"}>
                    <PluginExecutionIndicator />
                    <Spacer></Spacer>
                    <MpdProfileSelector></MpdProfileSelector>
                    <Spacer></Spacer>
                    <ColorModeSwitchButton></ColorModeSwitchButton>
                    <SettingsEntryButton></SettingsEntryButton>
                    <Spacer></Spacer>
                  </HStack>
                </HStack>
              </Box>
            </HStack>
          </GridItem>
          <GridItem area={"main"}>
            <Flex h="calc(100vh - 180px)" w="100vw">
              <Box
                className="layout-border-top layout-border-bottom"
                overflowX={"clip"}
                overflowY={"auto"}
                minW={isOpen ? "250px" : "20px"}
              >
                <SideNavigation {...{ isCompact: !isOpen }}></SideNavigation>
              </Box>
              <Box flexGrow={"1"} overflowY={"auto"}>
                <Outlet />
              </Box>
            </Flex>
          </GridItem>
          <GridItem area={"footer"}>
            <Player></Player>
          </GridItem>
        </Grid>
        <MpdEventObserver />
        <PluginExecutionModal />
      </Div100vh>
    </>
  );
}
