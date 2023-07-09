"use client";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { IoMenu } from "react-icons/io5";

import BrandLogo from "@/frontend/features/global/components/BrandLogo";
import ColorModeSwitchButton from "@/frontend/features/global/components/ColorModeSwitchButton";
import ProfileSelector from "@/frontend/features/global/components/ProfileSelector";
import SideNav from "@/frontend/features/global/components/SideNav";
import GlobalFilterBox from "@/frontend/features/global_filter/components/GlobalFilterBox";
import Player from "@/frontend/features/player/components/Player";
import SettingEntryButton from "@/frontend/features/setting/components/SettingEntryButton";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure({
    defaultIsOpen: true,
  });
  const [hidden, setHidden] = useState(!isOpen);

  return (
    <>
      <Grid
        templateAreas={`"header"
      "main"
      "footer"`}
        gridTemplateRows={"80px 1fr 100px"}
        maxH="100vh"
        gap="0px"
      >
        <GridItem area={"header"}>
          <HStack spacing={"0px"}>
            <Box w="250px" h="80px">
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
                  <ProfileSelector></ProfileSelector>
                  <ColorModeSwitchButton></ColorModeSwitchButton>
                  <SettingEntryButton></SettingEntryButton>
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
              as={motion.div}
              minW={"250px"}
              {...getDisclosureProps()}
              hidden={hidden}
              initial={true}
              onAnimationStart={() => setHidden(false)}
              onAnimationComplete={() => setHidden(!isOpen)}
              animate={{ width: isOpen ? 250 : 0 }}
            >
              <SideNav></SideNav>
            </Box>
            <Box flexGrow={"1"} overflowY={"auto"}>
              {children}
            </Box>
          </Flex>
        </GridItem>
        <GridItem area={"footer"}>
          <Player></Player>
        </GridItem>
      </Grid>
    </>
  );
}
