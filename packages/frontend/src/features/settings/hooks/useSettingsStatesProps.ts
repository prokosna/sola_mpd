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
import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";

import { UpdateMode } from "../../../types/stateTypes";
import {
	browserStateAtom,
	recentlyAddedStateAtom,
	updateBrowserStateActionAtom,
	updateRecentlyAddedStateActionAtom,
} from "../../browsing";
import { pluginAtom, updatePluginActionAtom } from "../../plugin";
import {
	mpdProfileStateAtom,
	updateMpdProfileStateActionAtom,
} from "../../profile";
import { savedSearchesAtom, updateSavedSearchesActionAtom } from "../../search";
import type { SettingsStatesEditorProps } from "../components/SettingsStatesEditor";
import { useRawSongTableStateEditorProps } from "./useRawSongTableStateEditorProps";
import { useSettingsStateEditorProps } from "./useSettingsStateEditorProps";

export type SettingsStatesRow = {
	name: string;
	onEdit: () => void;
	note: string | undefined;
};

export type SettingsStatesProps = {
	rows: SettingsStatesRow[];
	profileStateProps: SettingsStatesEditorProps<MpdProfileState>;
	songTableStateProps: SettingsStatesEditorProps<SongTableState>;
	browserStateProps: SettingsStatesEditorProps<BrowserState>;
	recentlyAddedStateProps: SettingsStatesEditorProps<RecentlyAddedState>;
	savedSearchesProps: SettingsStatesEditorProps<SavedSearches>;
	pluginStateProps: SettingsStatesEditorProps<PluginState>;
};

const persistMode = UpdateMode.LOCAL_STATE | UpdateMode.PERSIST;

export function useSettingsStatesProps(): SettingsStatesProps | undefined {
	const mpdProfileState = useAtomValue(mpdProfileStateAtom);
	const updateMpdProfileState = useSetAtom(updateMpdProfileStateActionAtom);
	const [onOpenProfileState, profileStateProps] =
		useSettingsStateEditorProps<MpdProfileState>(
			MpdProfileStateSchema,
			mpdProfileState,
			async (state: MpdProfileState) => {
				return updateMpdProfileState({ state, mode: persistMode });
			},
		);

	const [onOpenSongTableState, songTableStateProps] =
		useRawSongTableStateEditorProps();

	const browserState = useAtomValue(browserStateAtom);
	const updateBrowserState = useSetAtom(updateBrowserStateActionAtom);
	const [onOpenBrowserState, browserStateProps] =
		useSettingsStateEditorProps<BrowserState>(
			BrowserStateSchema,
			browserState,
			async (state: BrowserState) => {
				return updateBrowserState({ state, mode: persistMode });
			},
		);

	const savedSearches = useAtomValue(savedSearchesAtom);
	const updateSavedSearches = useSetAtom(updateSavedSearchesActionAtom);
	const [onOpenSavedSearches, savedSearchesProps] =
		useSettingsStateEditorProps<SavedSearches>(
			SavedSearchesSchema,
			savedSearches,
			async (savedSearches: SavedSearches) => {
				return updateSavedSearches({ savedSearches, mode: persistMode });
			},
		);

	const pluginState = useAtomValue(pluginAtom);
	const updatePlugin = useSetAtom(updatePluginActionAtom);
	const [onOpenPluginState, pluginStateProps] =
		useSettingsStateEditorProps<PluginState>(
			PluginStateSchema,
			pluginState,
			async (pluginState: PluginState) => {
				return updatePlugin({ pluginState, mode: persistMode });
			},
		);

	const recentlyAddedState = useAtomValue(recentlyAddedStateAtom);
	const updateRecentlyAddedState = useSetAtom(
		updateRecentlyAddedStateActionAtom,
	);
	const [onOpenRecentlyAddedState, recentlyAddedStateProps] =
		useSettingsStateEditorProps<RecentlyAddedState>(
			RecentlyAddedStateSchema,
			recentlyAddedState,
			async (state: RecentlyAddedState) => {
				return updateRecentlyAddedState({ state, mode: persistMode });
			},
		);

	if (
		profileStateProps === undefined ||
		songTableStateProps === undefined ||
		browserStateProps === undefined ||
		savedSearchesProps === undefined ||
		pluginStateProps === undefined ||
		recentlyAddedStateProps === undefined
	) {
		return undefined;
	}

	// Every document editable here is a Workspace document. Device settings
	// have no row because they are not server-fetched protobuf documents.
	const rows: SettingsStatesRow[] = [
		{ name: "Profile", onEdit: onOpenProfileState, note: undefined },
		{
			name: "Song Table",
			onEdit: onOpenSongTableState,
			note:
				"Only the column set and their order are read from here. Widths " +
				"and sort order are stored per device.",
		},
		{ name: "Browser", onEdit: onOpenBrowserState, note: undefined },
		{
			name: "Recently Added",
			onEdit: onOpenRecentlyAddedState,
			note: undefined,
		},
		{ name: "Saved Searches", onEdit: onOpenSavedSearches, note: undefined },
		{ name: "Plugins", onEdit: onOpenPluginState, note: undefined },
	];

	return {
		rows,
		profileStateProps,
		songTableStateProps,
		browserStateProps,
		recentlyAddedStateProps,
		savedSearchesProps,
		pluginStateProps,
	};
}
