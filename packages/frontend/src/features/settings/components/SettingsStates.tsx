import { Button, Stack, Table, Text, Title } from "@mantine/core";
import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";

import { CenterSpinner } from "../../loading";
import { useSettingsStatesProps } from "../hooks/useSettingsStatesProps";
import { ScopeNote } from "./ScopeNote";
import { SettingsStatesEditor } from "./SettingsStatesEditor";

export function SettingsStates() {
	const props = useSettingsStatesProps();

	if (props === undefined) {
		return <CenterSpinner />;
	}

	return (
		<>
			<Stack gap={16}>
				<Title order={1} size="lg">
					Raw Data
				</Title>
				<Text c="red" size="sm">
					Editing these documents directly can corrupt your settings.
				</Text>
				<Table maw="70%">
					<Table.Thead>
						<Table.Tr>
							<Table.Th>STATE</Table.Th>
							<Table.Th>SCOPE</Table.Th>
							<Table.Th>ACTION</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{props.rows.map((row) => (
							<Table.Tr key={row.name}>
								<Table.Td>
									<Stack gap={2}>
										<Text>{row.name}</Text>
										{row.note !== undefined && (
											<Text size="xs" c="dimmed">
												{row.note}
											</Text>
										)}
									</Stack>
								</Table.Td>
								<Table.Td>
									<ScopeNote scope="workspace" />
								</Table.Td>
								<Table.Td>
									<Button variant="outline" size="xs" onClick={row.onEdit}>
										Edit
									</Button>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</Stack>
			<SettingsStatesEditor<MpdProfileState> {...props.profileStateProps} />
			<SettingsStatesEditor<SongTableState> {...props.songTableStateProps} />
			<SettingsStatesEditor<BrowserState> {...props.browserStateProps} />
			<SettingsStatesEditor<RecentlyAddedState>
				{...props.recentlyAddedStateProps}
			/>
			<SettingsStatesEditor<SavedSearches> {...props.savedSearchesProps} />
			<SettingsStatesEditor<PluginState> {...props.pluginStateProps} />
		</>
	);
}
