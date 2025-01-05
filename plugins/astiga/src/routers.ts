import { Code, ConnectError, type ConnectRouter } from "@connectrpc/connect";
import {
	type PluginExecuteRequest,
	type PluginExecuteResponse,
	PluginInfo,
	type PluginRegisterRequest,
	PluginRegisterResponse,
	Plugin_PluginType,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { PluginService } from "@sola_mpd/domain/src/models/plugin/plugin_service_connect.js";

import { syncWithAstiga } from "./service.js";

export function routes(router: ConnectRouter) {
	router.service(PluginService, {
		register(_req: PluginRegisterRequest): PluginRegisterResponse {
			return new PluginRegisterResponse({
				info: new PluginInfo({
					name: "Astiga",
					version: process.env.npm_package_version,
					description: "Plugin to synchronize songs with an Astiga playlist.",
					contextMenuTitle: "Sync with Astiga",
					contextMenuDescription:
						"Start synchronization with the Astiga playlist.",
					supportedTypes: [
						Plugin_PluginType.ON_BROWSER,
						Plugin_PluginType.ON_FILE_EXPLORE,
						Plugin_PluginType.ON_PLAYLIST,
						Plugin_PluginType.ON_PLAY_QUEUE,
						Plugin_PluginType.ON_SAVED_SEARCH,
						Plugin_PluginType.ON_FULL_TEXT_SEARCH,
						Plugin_PluginType.ON_RECENTLY_ADDED,
					],
					requiredPluginParameters: ["User", "Password"],
					requiredRequestParameters: ["Playlist Name"],
				}),
			});
		},

		async *execute(
			req: PluginExecuteRequest,
		): AsyncGenerator<PluginExecuteResponse, void, unknown> {
			try {
				const user = req.pluginParameters.User;
				const password = req.pluginParameters.Password;
				const playlistName = req.requestParameters["Playlist Name"];
				const songs = req.songs;
				for await (const resp of syncWithAstiga(
					user,
					password,
					playlistName,
					songs,
				)) {
					yield resp;
				}
			} catch (e) {
				if (e instanceof Error) {
					throw new ConnectError(e.message, Code.Internal);
				}
				throw new ConnectError(
					`Plugin execution failed: ${String(e)}`,
					Code.Internal,
				);
			}
		},
	});
}
