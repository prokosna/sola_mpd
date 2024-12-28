import { Tabs, TabList, Tab, TabPanels, TabPanel, Box } from "@chakra-ui/react";

import { Profiles } from "./Profiles";
import { SettingsStates } from "./SettingsStates";

/**
 * Settings component that renders a tabbed interface for Profiles and Settings.
 * This component uses Chakra UI's Tab components to organize and display
 * different sections of the application settings.
 *
 * @returns A tabbed interface containing Profiles and Settings panels
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
