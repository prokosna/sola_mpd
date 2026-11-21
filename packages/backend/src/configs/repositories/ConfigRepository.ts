import type { Message } from "@bufbuild/protobuf";
import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { PluginState } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";

export interface ConfigRepository<T extends Message> {
	get: () => T;
	update: (value: T) => void;
}

export type ConfigRepositories = {
	browserState: ConfigRepository<BrowserState>;
	commonSongTableState: ConfigRepository<SongTableState>;
	mpdProfileState: ConfigRepository<MpdProfileState>;
	pluginState: ConfigRepository<PluginState>;
	recentlyAddedState: ConfigRepository<RecentlyAddedState>;
	savedSearches: ConfigRepository<SavedSearches>;
};
