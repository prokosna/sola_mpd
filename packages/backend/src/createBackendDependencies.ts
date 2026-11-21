import type { AdvancedSearchApi } from "./advanced_search/services/AdvancedSearchApi.js";
import { AdvancedSearchApiHttp } from "./advanced_search/services/AdvancedSearchApiHttp.js";
import type { ConfigRepositories } from "./configs/repositories/ConfigRepository.js";
import { createConfigRepositoriesFile } from "./configs/repositories/ConfigRepositoryFile.js";
import type { MpdClient } from "./mpd/services/MpdClient.js";
import { MpdClientMpd3 } from "./mpd/services/MpdClientMpd3.js";
import type { PluginClient } from "./plugins/services/PluginClient.js";
import { PluginClientConnect } from "./plugins/services/PluginClientConnect.js";
import type { ViewStateBlobRepository } from "./view_state_blobs/repositories/ViewStateBlobRepository.js";
import { ViewStateBlobRepositoryFile } from "./view_state_blobs/repositories/ViewStateBlobRepositoryFile.js";

export type BackendDependencies = {
	mpdClient: MpdClient;
	pluginClient: PluginClient;
	advancedSearchApi: AdvancedSearchApi;
	configRepositories: ConfigRepositories;
	viewStateBlobRepository: ViewStateBlobRepository;
};

export function createBackendDependencies(options: {
	dbDirectory: string;
}): BackendDependencies {
	return {
		mpdClient: new MpdClientMpd3(),
		pluginClient: new PluginClientConnect(),
		advancedSearchApi: new AdvancedSearchApiHttp(),
		configRepositories: createConfigRepositoriesFile(options.dbDirectory),
		viewStateBlobRepository: new ViewStateBlobRepositoryFile(
			options.dbDirectory,
		),
	};
}
