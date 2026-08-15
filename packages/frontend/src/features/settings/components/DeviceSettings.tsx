import { Button, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { resetPaneLayout } from "../../../lib/resizablePanels/resetPaneLayout";
import { advancedSearchStatsAtom } from "../../advanced_search";
import {
	resetSongTableColumnLayoutActionAtom,
	resetSongTableDeviceLayoutActionAtom,
	songTableDeviceLayoutAtom,
} from "../../song_table";
import { AdvancedSearchSettings } from "./AdvancedSearchSettings";
import { ColorModeSwitchButton } from "./ColorModeSwitchButton";
import { Locale } from "./Locale";
import { ScopeNote } from "./ScopeNote";

export function DeviceSettings() {
	const advancedSearchStats = useAtomValue(advancedSearchStatsAtom);
	const resetSongTableColumnLayout = useSetAtom(
		resetSongTableColumnLayoutActionAtom,
	);
	const resetSongTableDeviceLayout = useSetAtom(
		resetSongTableDeviceLayoutActionAtom,
	);
	// Both resets no-op until the device layout resolves, so offering them
	// before that would report a success that did not happen.
	const isDeviceLayoutReady =
		useAtomValue(songTableDeviceLayoutAtom) !== undefined;
	const notify = useNotification();

	const handleResetColumnWidths = () => {
		resetSongTableColumnLayout();
		notify({
			status: "success",
			title: "Column widths reset",
			description: "Song table column widths on this device have been reset.",
		});
	};

	const handleResetLayout = () => {
		resetSongTableDeviceLayout();
		resetPaneLayout();
		notify({
			status: "success",
			title: "Layout reset to defaults",
			description:
				"Column widths, sort, and pane sizes on this device have been reset " +
				"to the application defaults. Reopen the affected view to see the " +
				"default pane sizes.",
		});
	};

	return (
		<Stack gap={32}>
			<Stack gap={4}>
				<Title order={1} size="lg">
					Device Settings
				</Title>
				<ScopeNote scope="device" />
				<Text size="sm" c="dimmed" maw={720}>
					These are stored in this browser only. Other devices connected to the
					same server keep their own, and clearing this browser's site data
					resets them.
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

			<Divider />

			<Stack gap={12}>
				<Title order={2} size="md">
					Layout
				</Title>
				<Text size="sm" c="dimmed">
					Resets apply to this device only and take effect immediately.
				</Text>
				<Group gap={16}>
					<Button
						variant="outline"
						disabled={!isDeviceLayoutReady}
						onClick={handleResetColumnWidths}
					>
						Reset column widths
					</Button>
					<Button
						variant="outline"
						disabled={!isDeviceLayoutReady}
						onClick={handleResetLayout}
					>
						Reset layout to defaults
					</Button>
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
