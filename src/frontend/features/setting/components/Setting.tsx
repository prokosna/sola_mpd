"use client";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React from "react";

import Profiles from "./Profiles";
import SettingStates from "./SettingStates";

export default function Setting() {
  return (
    <>
      <Box
        w="100%"
        h="full"
        borderTop={"1px solid"}
        borderLeft={"1px solid"}
        borderColor={"gray.300"}
      >
        <Tabs>
          <TabList>
            <Tab>Profiles</Tab>
            <Tab>Settings</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Profiles></Profiles>
            </TabPanel>
            <TabPanel>
              <SettingStates></SettingStates>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
}
