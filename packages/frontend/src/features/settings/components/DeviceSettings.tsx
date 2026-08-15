import { Divider, Group, Stack, Text, Title } from "@mantine/core";
import { useAtomValue } from "jotai";
import { advancedSearchStatsAtom } from "../../advanced_search";
import { AdvancedSearchSettings } from "./AdvancedSearchSettings";
import { ColorModeSwitchButton } from "./ColorModeSwitchButton";
import { Locale } from "./Locale";
import { ScopeNote } from "./ScopeNote";

export function DeviceSettings() {
	const advancedSearchStats = useAtomValue(advancedSearchStatsAtom);

	return (
		<Stack gap={32}>
			<Stack gap={4}>
				<Title order={1} size="lg">
					This Device
				</Title>
				<ScopeNote scope="device" />
				<Text size="sm" c="dimmed" maw={720}>
					Stored in this browser. Other devices keep their own values, and
					clearing site data resets these.
				</Text>
			</Stack>

			<Divider />

			<Locale />

			<Divider />

			<Stack gap={12}>
				<Title order={2} size="md">
					Theme
				</Title>
				<Group>
					<ColorModeSwitchButton />
				</Group>
			</Stack>

			{advancedSearchStats !== undefined && (
				<>
					<Divider />
					<AdvancedSearchSettings stats={advancedSearchStats} />
				</>
			)}
		</Stack>
	);
}
