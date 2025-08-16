import { Box, Tabs } from "@mantine/core";
import { Locale } from "./Locale";
import { Profiles } from "./Profiles";
import { SettingsStates } from "./SettingsStates";

/**
 * Settings interface with profiles and preferences tabs.
 */
export function Settings() {
	return (
		<>
			<Box w="100%" h="100%">
				<Tabs defaultValue="Profiles">
					<Tabs.List>
						<Tabs.Tab value="Profiles">Profiles</Tabs.Tab>
						<Tabs.Tab value="Locale">Locale</Tabs.Tab>
						<Tabs.Tab value="Settings">Settings</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value="Profiles">
						<Box p={16}>
							<Profiles />
						</Box>
					</Tabs.Panel>
					<Tabs.Panel value="Locale">
						<Box p={16}>
							<Locale />
						</Box>
					</Tabs.Panel>
					<Tabs.Panel value="Settings">
						<Box p={16}>
							<SettingsStates />
						</Box>
					</Tabs.Panel>
				</Tabs>
			</Box>
		</>
	);
}
