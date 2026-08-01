import { Box, Tabs } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useNavigate, useParams } from "react-router";
import { ROUTE_HOME_SETTINGS } from "../../../const/routes";
import { advancedSearchStatsAtom } from "../../advanced_search";
import { AdvancedSearchSettings } from "./AdvancedSearchSettings";
import { Locale } from "./Locale";
import { Profiles } from "./Profiles";
import { SettingsStates } from "./SettingsStates";

const TAB_SLUG_TO_VALUE: Record<string, string> = {
	profiles: "Profiles",
	locale: "Locale",
	"raw-data": "Raw Data",
	"advanced-search": "Advanced Search",
};
const TAB_VALUE_TO_SLUG: Record<string, string> = Object.fromEntries(
	Object.entries(TAB_SLUG_TO_VALUE).map(([slug, value]) => [value, slug]),
);
const DEFAULT_TAB_VALUE = "Profiles";

export function Settings() {
	const advancedSearchStats = useAtomValue(advancedSearchStatsAtom);
	const { tab } = useParams<{ tab?: string }>();
	const navigate = useNavigate();
	const activeTab =
		tab !== undefined
			? (TAB_SLUG_TO_VALUE[tab] ?? DEFAULT_TAB_VALUE)
			: DEFAULT_TAB_VALUE;

	function handleTabChange(value: string | null) {
		if (value === null) {
			return;
		}
		navigate(`${ROUTE_HOME_SETTINGS}/${TAB_VALUE_TO_SLUG[value] ?? value}`);
	}

	return (
		<Box w="100%" h="100%">
			<Tabs value={activeTab} onChange={handleTabChange}>
				<Tabs.List>
					<Tabs.Tab value="Profiles">Profiles</Tabs.Tab>
					<Tabs.Tab value="Locale">Locale</Tabs.Tab>
					<Tabs.Tab value="Raw Data">Raw Data</Tabs.Tab>
					{advancedSearchStats !== undefined && (
						<Tabs.Tab value="Advanced Search">Advanced Search</Tabs.Tab>
					)}
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
				<Tabs.Panel value="Raw Data">
					<Box p={16}>
						<SettingsStates />
					</Box>
				</Tabs.Panel>
				{advancedSearchStats !== undefined && (
					<Tabs.Panel value="Advanced Search">
						<Box p={16}>
							<AdvancedSearchSettings stats={advancedSearchStats} />
						</Box>
					</Tabs.Panel>
				)}
			</Tabs>
		</Box>
	);
}
