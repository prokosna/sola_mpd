import { Tabs, TabList, Tab, TabPanels, TabPanel, Box } from "@chakra-ui/react";

import { Profiles } from "./Profiles";
import { SettingsStates } from "./SettingsStates";

/**
 * Settings interface with profiles and preferences tabs.
 */
export function Settings() {
  return (
    <>
      <Box className="layout-border-top layout-border-left" w="100%" h="full">
        <Tabs>
          <TabList>
            <Tab>Profiles</Tab>
            <Tab>Settings</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Profiles />
            </TabPanel>
            <TabPanel>
              <SettingsStates />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
}
