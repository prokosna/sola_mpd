import { create } from "@bufbuild/protobuf";
import { Code, ConnectError, type ConnectRouter } from "@connectrpc/connect";

import {
	Plugin_PluginType,
	type PluginExecuteRequest,
	type PluginExecuteResponse,
	PluginInfoSchema,
	type PluginRegisterRequest,
	type PluginRegisterResponse,
	PluginRegisterResponseSchema,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import { PluginService } from "@sola_mpd/domain/src/models/plugin/plugin_service_pb.js";

import { syncWithSubsonic } from "./service.js";

export function routes(router: ConnectRouter) {
	router.service(PluginService, {
		register(_req: PluginRegisterRequest): PluginRegisterResponse {
			return create(PluginRegisterResponseSchema, {
				info: create(PluginInfoSchema, {
					name: "Subsonic",
					version: process.env.npm_package_version,
					description: "Plugin to synchronize songs with a Subsonic playlist.",
					contextMenuTitle: "Sync with Subsonic",
					contextMenuDescription:
						"Start synchronization with the Subsonic playlist.",
					supportedTypes: [
						Plugin_PluginType.ON_BROWSER,
						Plugin_PluginType.ON_FILE_EXPLORE,
						Plugin_PluginType.ON_PLAYLIST,
						Plugin_PluginType.ON_PLAY_QUEUE,
						Plugin_PluginType.ON_SAVED_SEARCH,
						Plugin_PluginType.ON_FULL_TEXT_SEARCH,
						Plugin_PluginType.ON_RECENTLY_ADDED,
					],
					requiredPluginParameters: ["Url", "User", "Password"],
					requiredRequestParameters: ["Playlist Name"],
				}),
			});
		},

		async *execute(
			req: PluginExecuteRequest,
		): AsyncGenerator<PluginExecuteResponse, void, unknown> {
			try {
				const url = req.pluginParameters.Url;
				const user = req.pluginParameters.User;
				const password = req.pluginParameters.Password;
				const playlistName = req.requestParameters["Playlist Name"];
				const songs = req.songs;
				for await (const resp of syncWithSubsonic(
					url,
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
