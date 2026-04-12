import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";

import {
	readBrowserState,
	readCommonSongTableState,
	readMpdProfileState,
	readPluginState,
	readRecentlyAddedState,
	readSavedSearches,
	updateBrowserState,
	updateCommonSongTableState,
	updateMpdProfileState,
	updatePluginState,
	updateRecentlyAddedState,
	updateSavedSearches,
} from "../application/configStateUseCases.js";
import type { ConfigMessageHandler } from "./ConfigMessageHandler.js";

const readUseCases: Record<string, () => Buffer> = {
	[CONFIG_KEY_BROWSER_STATE]: readBrowserState,
	[CONFIG_KEY_COMMON_SONG_TABLE_STATE]: readCommonSongTableState,
	[CONFIG_KEY_MPD_PROFILE_STATE]: readMpdProfileState,
	[CONFIG_KEY_PLUGIN_STATE]: readPluginState,
	[CONFIG_KEY_SAVED_SEARCHES]: readSavedSearches,
	[CONFIG_KEY_RECENTLY_ADDED_STATE]: readRecentlyAddedState,
};

const writeUseCases: Record<string, (data: Buffer) => void> = {
	[CONFIG_KEY_BROWSER_STATE]: updateBrowserState,
	[CONFIG_KEY_COMMON_SONG_TABLE_STATE]: updateCommonSongTableState,
	[CONFIG_KEY_MPD_PROFILE_STATE]: updateMpdProfileState,
	[CONFIG_KEY_PLUGIN_STATE]: updatePluginState,
	[CONFIG_KEY_SAVED_SEARCHES]: updateSavedSearches,
	[CONFIG_KEY_RECENTLY_ADDED_STATE]: updateRecentlyAddedState,
};

export class ConfigMessageHandlerSocketIo implements ConfigMessageHandler {
	fetch = (configKey: string): Buffer => {
		const useCase = readUseCases[configKey];
		if (useCase === undefined) {
			throw new Error(`Unknown config key: ${configKey}`);
		}
		return useCase();
	};

	save = (configKey: string, data: Buffer): void => {
		const useCase = writeUseCases[configKey];
		if (useCase === undefined) {
			throw new Error(`Unknown config key: ${configKey}`);
		}
		useCase(data);
	};
}
