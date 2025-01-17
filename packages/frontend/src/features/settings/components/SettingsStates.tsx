import {
	IconButton,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	VStack,
} from "@chakra-ui/react";
import { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";
import { LayoutState } from "@sola_mpd/domain/src/models/layout_pb.js";
import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { PluginState } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { RecentlyAddedState } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";
import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { IoCreate } from "react-icons/io5";

import { UpdateMode } from "../../../types/stateTypes";
import {
	useRecentlyAddedState,
	useUpdateRecentlyAddedState,
} from "../../browsing";
import {
	useBrowserState,
	useUpdateBrowserState,
} from "../../browsing/browser/states/browserState";
import { useLayoutState, useUpdateLayoutState } from "../../layout";
import { CenterSpinner } from "../../loading";
import { usePluginState, useUpdatePluginState } from "../../plugin";
import { useMpdProfileState, useUpdateMpdProfileState } from "../../profile";
import {
	useSavedSearchesState,
	useUpdateSavedSearchesState,
} from "../../search";
import { useSongTableState, useUpdateSongTableState } from "../../song_table";
import { useSettingsStateEditorProps } from "../hooks/useSettingsStateEditorProps";

import { SettingsStatesEditor } from "./SettingsStatesEditor";

/**
 * Application state management interface.
 *
 * Provides a table for viewing and editing various application
 * states like profiles, layout, browser, and search history.
 */
export function SettingsStates() {
	const mpdProfileState = useMpdProfileState();
	const updateMpdProfileState = useUpdateMpdProfileState();
	const [onOpenProfileState, profileStateProps] =
		useSettingsStateEditorProps<MpdProfileState>(
			mpdProfileState,
			async (newState: MpdProfileState) => {
				updateMpdProfileState(
					newState,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
			MpdProfileState.fromJson,
		);

	const layoutState = useLayoutState();
	const updateLayoutState = useUpdateLayoutState();
	const [onOpenLayoutState, layoutStateProps] =
		useSettingsStateEditorProps<LayoutState>(
			layoutState,
			async (newState: LayoutState) => {
				updateLayoutState(
					newState,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
			LayoutState.fromJson,
		);

	const songTableState = useSongTableState();
	const updateSongTableState = useUpdateSongTableState();
	const [onOpenSongTableState, songTableStateProps] =
		useSettingsStateEditorProps<SongTableState>(
			songTableState,
			async (newState: SongTableState) => {
				updateSongTableState(
					newState,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
			SongTableState.fromJson,
		);

	const browserState = useBrowserState();
	const updateBrowserState = useUpdateBrowserState();
	const [onOpenBrowserState, browserStateProps] =
		useSettingsStateEditorProps<BrowserState>(
			browserState,
			async (newState: BrowserState) => {
				updateBrowserState(
					newState,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
			BrowserState.fromJson,
		);

	const savedSearches = useSavedSearchesState();
	const updateSavedSearches = useUpdateSavedSearchesState();
	const [onOpenSavedSearches, savedSearchesProps] =
		useSettingsStateEditorProps<SavedSearches>(
			savedSearches,
			async (savedSearches: SavedSearches) => {
				updateSavedSearches(
					savedSearches,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
			SavedSearches.fromJson,
		);

	const pluginState = usePluginState();
	const updatePluginState = useUpdatePluginState();
	const [onOpenPluginState, pluginStateProps] =
		useSettingsStateEditorProps<PluginState>(
			pluginState,
			async (pluginState: PluginState) => {
				updatePluginState(
					pluginState,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
			PluginState.fromJson,
		);

	const recentlyAddedState = useRecentlyAddedState();
	const updateRecentlyAddedState = useUpdateRecentlyAddedState();
	const [onOpenRecentlyAddedState, recentlyAddedStateProps] =
		useSettingsStateEditorProps<RecentlyAddedState>(
			recentlyAddedState,
			async (recentlyAddedState: RecentlyAddedState) => {
				updateRecentlyAddedState(
					recentlyAddedState,
					UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
				);
			},
			RecentlyAddedState.fromJson,
		);

	if (
		mpdProfileState === undefined ||
		profileStateProps === undefined ||
		layoutState === undefined ||
		layoutStateProps === undefined ||
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
		return <CenterSpinner className="layout-border-top layout-border-left" />;
	}

	return (
		<>
			<VStack spacing={"12px"} align={"start"}>
				<TableContainer>
					<Table variant="simple">
						<Thead>
							<Tr>
								<Th>STATE</Th>
								<Th>ACTION</Th>
							</Tr>
						</Thead>
						<Tbody>
							<Tr>
								<Td>Profile</Td>
								<Td>
									<IconButton
										variant="outline"
										aria-label="Edit"
										size="xs"
										icon={<IoCreate />}
										onClick={onOpenProfileState}
									/>
								</Td>
							</Tr>
							<Tr>
								<Td>Layout</Td>
								<Td>
									<IconButton
										variant="outline"
										aria-label="Edit"
										size="xs"
										icon={<IoCreate />}
										onClick={onOpenLayoutState}
									/>
								</Td>
							</Tr>
							<Tr>
								<Td>Song Table</Td>
								<Td>
									<IconButton
										variant="outline"
										aria-label="Edit"
										size="xs"
										icon={<IoCreate />}
										onClick={onOpenSongTableState}
									/>
								</Td>
							</Tr>
							<Tr>
								<Td>Browser</Td>
								<Td>
									<IconButton
										variant="outline"
										aria-label="Edit"
										size="xs"
										icon={<IoCreate />}
										onClick={onOpenBrowserState}
									/>
								</Td>
							</Tr>
							<Tr>
								<Td>Recently Added</Td>
								<Td>
									<IconButton
										variant="outline"
										aria-label="Edit"
										size="xs"
										icon={<IoCreate />}
										onClick={onOpenRecentlyAddedState}
									/>
								</Td>
							</Tr>
							<Tr>
								<Td>Saved Searches</Td>
								<Td>
									<IconButton
										variant="outline"
										aria-label="Edit"
										size="xs"
										icon={<IoCreate />}
										onClick={onOpenSavedSearches}
									/>
								</Td>
							</Tr>
							<Tr>
								<Td>Plugins</Td>
								<Td>
									<IconButton
										variant="outline"
										aria-label="Edit"
										size="xs"
										icon={<IoCreate />}
										onClick={onOpenPluginState}
									/>
								</Td>
							</Tr>
						</Tbody>
					</Table>
				</TableContainer>
			</VStack>
			<SettingsStatesEditor<MpdProfileState> {...profileStateProps} />
			<SettingsStatesEditor<LayoutState> {...layoutStateProps} />
			<SettingsStatesEditor<SongTableState> {...songTableStateProps} />
			<SettingsStatesEditor<BrowserState> {...browserStateProps} />
			<SettingsStatesEditor<RecentlyAddedState> {...recentlyAddedStateProps} />
			<SettingsStatesEditor<SavedSearches> {...savedSearchesProps} />
			<SettingsStatesEditor<PluginState> {...pluginStateProps} />
		</>
	);
}
