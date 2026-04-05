import { Button, Stack, Table, Text, Title } from "@mantine/core";
import {
	type BrowserState,
	BrowserStateSchema,
} from "@sola_mpd/shared/src/models/browser_pb.js";
import {
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import {
	type PluginState,
	PluginStateSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	type RecentlyAddedState,
	RecentlyAddedStateSchema,
} from "@sola_mpd/shared/src/models/recently_added_pb.js";
import {
	type SavedSearches,
	SavedSearchesSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import {
	type SongTableState,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { UpdateMode } from "../../../types/stateTypes";
import {
	browserStateAtom,
	recentlyAddedStateAtom,
	updateBrowserStateActionAtom,
	updateRecentlyAddedStateActionAtom,
} from "../../browsing";
import { CenterSpinner } from "../../loading";
import { pluginAtom, updatePluginActionAtom } from "../../plugin";
import {
	mpdProfileStateAtom,
	updateMpdProfileStateActionAtom,
} from "../../profile";
import { savedSearchesAtom, updateSavedSearchesActionAtom } from "../../search";
import {
	songTableStateAtom,
	updateSongTableStateActionAtom,
} from "../../song_table";
import { useSettingsStateEditorProps } from "../hooks/useSettingsStateEditorProps";
import { SettingsStatesEditor } from "./SettingsStatesEditor";

/**
 * Application state management interface.
 *
 * Provides a table for viewing and editing various application
 * states like profiles, layout, browser, and search history.
 */
export function SettingsStates() {
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);
	const updateMpdProfileStateAction = useSetAtom(
		updateMpdProfileStateActionAtom,
	);
	const [onOpenProfileState, profileStateProps] =
		useSettingsStateEditorProps<MpdProfileState>(
			MpdProfileStateSchema,
			mpdProfileState,
			async (newState: MpdProfileState) => {
				updateMpdProfileStateAction({
					state: newState,
					mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				});
			},
		);

	const songTableState = useAtomValue(songTableStateAtom);
	const updateSongTableStateAction = useSetAtom(updateSongTableStateActionAtom);
	const [onOpenSongTableState, songTableStateProps] =
		useSettingsStateEditorProps<SongTableState>(
			SongTableStateSchema,
			songTableState,
			async (newState: SongTableState) => {
				updateSongTableStateAction({
					state: newState,
					mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				});
			},
		);

	const browserState = useAtomValue(browserStateAtom);
	const updateBrowserStateAction = useSetAtom(updateBrowserStateActionAtom);
	const updateBrowserState = useCallback(
		(state: BrowserState, mode: UpdateMode) =>
			updateBrowserStateAction({ state, mode }),
		[updateBrowserStateAction],
	);
	const [onOpenBrowserState, browserStateProps] =
		useSettingsStateEditorProps<BrowserState>(
			BrowserStateSchema,
			browserState,
			async (newState: BrowserState) => {
				updateBrowserState(
					newState,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
		);

	const savedSearches = useAtomValue(savedSearchesAtom);
	const updateSavedSearchesAction = useSetAtom(updateSavedSearchesActionAtom);
	const updateSavedSearches = useCallback(
		(savedSearches: SavedSearches, mode: UpdateMode) =>
			updateSavedSearchesAction({ savedSearches, mode }),
		[updateSavedSearchesAction],
	);
	const [onOpenSavedSearches, savedSearchesProps] =
		useSettingsStateEditorProps<SavedSearches>(
			SavedSearchesSchema,
			savedSearches,
			async (savedSearches: SavedSearches) => {
				updateSavedSearches(
					savedSearches,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
		);

	const pluginState = useAtomValue(pluginAtom);
	const updatePluginAction = useSetAtom(updatePluginActionAtom);
	const [onOpenPluginState, pluginStateProps] =
		useSettingsStateEditorProps<PluginState>(
			PluginStateSchema,
			pluginState,
			async (pluginState: PluginState) => {
				updatePluginAction({
					pluginState,
					mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				});
			},
		);

	const recentlyAddedState = useAtomValue(recentlyAddedStateAtom);
	const updateRecentlyAddedStateAction = useSetAtom(
		updateRecentlyAddedStateActionAtom,
	);
	const updateRecentlyAddedState = useCallback(
		(state: RecentlyAddedState, mode: UpdateMode) =>
			updateRecentlyAddedStateAction({ state, mode }),
		[updateRecentlyAddedStateAction],
	);
	const [onOpenRecentlyAddedState, recentlyAddedStateProps] =
		useSettingsStateEditorProps<RecentlyAddedState>(
			RecentlyAddedStateSchema,
			recentlyAddedState,
			async (recentlyAddedState: RecentlyAddedState) => {
				updateRecentlyAddedState(
					recentlyAddedState,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
		);

	if (
		mpdProfileState === undefined ||
		profileStateProps === undefined ||
		songTableState === undefined ||
		songTableStateProps === undefined ||
		browserState === undefined ||
		browserStateProps === undefined ||
		savedSearches === undefined ||
		savedSearchesProps === undefined ||
		pluginState === undefined ||
		pluginStateProps === undefined ||
		recentlyAddedState === undefined ||
		recentlyAddedStateProps === undefined
	) {
		return <CenterSpinner />;
	}

	const rows = [
		{ name: "Profile", onEdit: onOpenProfileState },
		{ name: "Song Table", onEdit: onOpenSongTableState },
		{ name: "Browser", onEdit: onOpenBrowserState },
		{ name: "Recently Added", onEdit: onOpenRecentlyAddedState },
		{ name: "Saved Searches", onEdit: onOpenSavedSearches },
		{ name: "Plugins", onEdit: onOpenPluginState },
	];

	return (
		<>
			<Stack gap={16}>
				<Title order={1} size="lg">
					Edit raw setting JSON files
				</Title>
				<Text c="red">Do not edit unless you know what you are doing.</Text>
				<Table maw="50%">
					<Table.Thead>
						<Table.Tr>
							<Table.Th>STATE</Table.Th>
							<Table.Th>ACTION</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.map((row) => (
							<Table.Tr key={row.name}>
								<Table.Td>{row.name}</Table.Td>
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
			<SettingsStatesEditor<MpdProfileState> {...profileStateProps} />
			<SettingsStatesEditor<SongTableState> {...songTableStateProps} />
			<SettingsStatesEditor<BrowserState> {...browserStateProps} />
			<SettingsStatesEditor<RecentlyAddedState> {...recentlyAddedStateProps} />
			<SettingsStatesEditor<SavedSearches> {...savedSearchesProps} />
			<SettingsStatesEditor<PluginState> {...pluginStateProps} />
		</>
	);
}
