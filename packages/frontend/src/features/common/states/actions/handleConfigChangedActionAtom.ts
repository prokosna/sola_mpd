import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";
import { atom } from "jotai";

import {
	refreshBrowserStateActionAtom,
	refreshRecentlyAddedStateActionAtom,
} from "../../../browsing";
import { refreshPluginActionAtom } from "../../../plugin";
import { refreshMpdProfileActionAtom } from "../../../profile";
import { refreshSavedSearchesActionAtom } from "../../../search";
import { refreshSongTableStateActionAtom } from "../../../song_table";

// An unrecognized key is ignored rather than thrown: an older client must stay
// functional when a newer server broadcasts a config key it does not know yet.
export const handleConfigChangedActionAtom = atom(
	null,
	(_get, set, configKey: string) => {
		switch (configKey) {
			case CONFIG_KEY_BROWSER_STATE:
				set(refreshBrowserStateActionAtom);
				return;
			case CONFIG_KEY_COMMON_SONG_TABLE_STATE:
				set(refreshSongTableStateActionAtom);
				return;
			case CONFIG_KEY_MPD_PROFILE_STATE:
				set(refreshMpdProfileActionAtom);
				return;
			case CONFIG_KEY_PLUGIN_STATE:
				set(refreshPluginActionAtom);
				return;
			case CONFIG_KEY_SAVED_SEARCHES:
				set(refreshSavedSearchesActionAtom);
				return;
			case CONFIG_KEY_RECENTLY_ADDED_STATE:
				set(refreshRecentlyAddedStateActionAtom);
				return;
			default:
				return;
		}
	},
);
