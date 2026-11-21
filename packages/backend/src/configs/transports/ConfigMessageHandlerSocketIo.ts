import type { Message } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { MpdProfileStateSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";

import {
	readConfigUseCase,
	updateConfigUseCase,
} from "../application/configStateUseCases.js";
import type {
	ConfigRepositories,
	ConfigRepository,
} from "../repositories/ConfigRepository.js";
import type { ConfigMessageHandler } from "./ConfigMessageHandler.js";

type ConfigBinding = {
	read: () => Buffer;
	update: (data: Buffer) => void;
};

function bind<T extends Message>(
	schema: GenMessage<T>,
	repository: ConfigRepository<T>,
): ConfigBinding {
	return {
		read: () => readConfigUseCase(schema, repository),
		update: (data) => updateConfigUseCase(schema, repository, data),
	};
}

export class ConfigMessageHandlerSocketIo implements ConfigMessageHandler {
	private readonly bindings: Record<string, ConfigBinding>;

	constructor(repositories: ConfigRepositories) {
		this.bindings = {
			[CONFIG_KEY_BROWSER_STATE]: bind(
				BrowserStateSchema,
				repositories.browserState,
			),
			[CONFIG_KEY_COMMON_SONG_TABLE_STATE]: bind(
				SongTableStateSchema,
				repositories.commonSongTableState,
			),
			[CONFIG_KEY_MPD_PROFILE_STATE]: bind(
				MpdProfileStateSchema,
				repositories.mpdProfileState,
			),
			[CONFIG_KEY_PLUGIN_STATE]: bind(
				PluginStateSchema,
				repositories.pluginState,
			),
			[CONFIG_KEY_SAVED_SEARCHES]: bind(
				SavedSearchesSchema,
				repositories.savedSearches,
			),
			[CONFIG_KEY_RECENTLY_ADDED_STATE]: bind(
				RecentlyAddedStateSchema,
				repositories.recentlyAddedState,
			),
		};
	}

	fetch = (configKey: string): Buffer => {
		const binding = this.bindings[configKey];
		if (binding === undefined) {
			throw new Error(`Unknown config key: ${configKey}`);
		}
		return binding.read();
	};

	save = (configKey: string, data: Buffer): void => {
		const binding = this.bindings[configKey];
		if (binding === undefined) {
			throw new Error(`Unknown config key: ${configKey}`);
		}
		binding.update(data);
	};
}
