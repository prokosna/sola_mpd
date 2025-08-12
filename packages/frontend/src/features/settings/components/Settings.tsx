import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

import { Locale } from "./Locale";
import { Profiles } from "./Profiles";
import { SettingsStates } from "./SettingsStates";

/**
 * Settings interface with profiles and preferences tabs.
 */
export function Settings() {
	return (
		<>
			<Box className="layout-border-top layout-border-left" w="100%" h="100%">
				<Tabs>
					<TabList>
						<Tab>Profiles</Tab>
						<Tab>Locale</Tab>
						<Tab>Settings</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<Profiles />
						</TabPanel>
						<TabPanel>
							<Locale />
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
