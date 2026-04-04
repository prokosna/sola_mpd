import { fromBinary, type Message, toBinary } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { MpdProfileStateSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";

import { browserStateRepository } from "../repositories/browserStateRepository.js";
import { commonSongTableStateRepository } from "../repositories/commonSongTableStateRepository.js";
import { mpdProfileStateRepository } from "../repositories/mpdProfileStateRepository.js";
import { pluginStateRepository } from "../repositories/pluginStateRepository.js";
import { recentlyAddedStateRepository } from "../repositories/recentlyAddedStateRepository.js";
import { savedSearchRepository } from "../repositories/savedSearchRepository.js";

interface ConfigRepository<T extends Message> {
	get: () => T;
	update: (value: T) => void;
}

const createReadConfigUseCase = <T extends Message>(
	schema: GenMessage<T>,
	repository: ConfigRepository<T>,
) => {
	return (): Buffer => {
		const value = repository.get();
		return Buffer.from(toBinary(schema, value));
	};
};

const createUpdateConfigUseCase = <T extends Message>(
	schema: GenMessage<T>,
	repository: ConfigRepository<T>,
) => {
	return (body: Buffer): void => {
		const data = fromBinary(schema, new Uint8Array(body));
		repository.update(data);
	};
};

export const readBrowserState = createReadConfigUseCase(
	BrowserStateSchema,
	browserStateRepository,
);
export const updateBrowserState = createUpdateConfigUseCase(
	BrowserStateSchema,
	browserStateRepository,
);

export const readCommonSongTableState = createReadConfigUseCase(
	SongTableStateSchema,
	commonSongTableStateRepository,
);
export const updateCommonSongTableState = createUpdateConfigUseCase(
	SongTableStateSchema,
	commonSongTableStateRepository,
);

export const readMpdProfileState = createReadConfigUseCase(
	MpdProfileStateSchema,
	mpdProfileStateRepository,
);
export const updateMpdProfileState = createUpdateConfigUseCase(
	MpdProfileStateSchema,
	mpdProfileStateRepository,
);

export const readPluginState = createReadConfigUseCase(
	PluginStateSchema,
	pluginStateRepository,
);
export const updatePluginState = createUpdateConfigUseCase(
	PluginStateSchema,
	pluginStateRepository,
);

export const readSavedSearches = createReadConfigUseCase(
	SavedSearchesSchema,
	savedSearchRepository,
);
export const updateSavedSearches = createUpdateConfigUseCase(
	SavedSearchesSchema,
	savedSearchRepository,
);

export const readRecentlyAddedState = createReadConfigUseCase(
	RecentlyAddedStateSchema,
	recentlyAddedStateRepository,
);
export const updateRecentlyAddedState = createUpdateConfigUseCase(
	RecentlyAddedStateSchema,
	recentlyAddedStateRepository,
);
