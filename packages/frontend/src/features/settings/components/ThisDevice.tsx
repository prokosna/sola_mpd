import { Button, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { resetPaneLayout } from "../../../lib/resizablePanels/resetPaneLayout";
import { advancedSearchStatsAtom } from "../../advanced_search";
import { resetSongTableColumnLayoutActionAtom } from "../../song_table";
import { AdvancedSearchSettings } from "./AdvancedSearchSettings";
import { ColorModeSwitchButton } from "./ColorModeSwitchButton";
import { Locale } from "./Locale";
import { ScopeNote } from "./ScopeNote";

export function ThisDevice() {
	const advancedSearchStats = useAtomValue(advancedSearchStatsAtom);
	const resetSongTableColumnLayout = useSetAtom(
		resetSongTableColumnLayoutActionAtom,
	);
	const notify = useNotification();

	const handleResetColumnWidths = () => {
		resetSongTableColumnLayout();
		notify({
			status: "success",
			title: "Column widths reset",
			description:
				"Song table column widths and sort order on this device have been reset.",
		});
	};

	const handleResetLayout = () => {
		resetPaneLayout();
		notify({
			status: "success",
			title: "Layout reset",
			description:
				"Pane sizes on this device have been reset. Reopen the affected " +
				"view to see the default layout.",
		});
	};

	return (
		<Stack gap={32}>
			<Stack gap={12}>
				<ScopeNote scope="device" />
				<Locale />
			</Stack>

			<Divider />

			<Stack gap={12}>
				<Title order={1} size="lg">
					Theme
				</Title>
				<ScopeNote scope="device" />
				<Group>
					<ColorModeSwitchButton />
				</Group>
			</Stack>

			<Divider />

			<Stack gap={12}>
				<Title order={1} size="lg">
					Layout
				</Title>
				<ScopeNote scope="device" />
				<Text size="sm" c="dimmed">
					Resets apply to this device only and take effect immediately.
				</Text>
				<Group gap={16}>
					<Button variant="outline" onClick={handleResetColumnWidths}>
						Reset column widths
					</Button>
					<Button variant="outline" onClick={handleResetLayout}>
						Reset layout
					</Button>
				</Group>
			</Stack>

			{advancedSearchStats !== undefined && (
				<>
					<Divider />
					<Stack gap={12}>
						<ScopeNote scope="device" />
						<AdvancedSearchSettings stats={advancedSearchStats} />
					</Stack>
				</>
			)}
		</Stack>
	);
}
