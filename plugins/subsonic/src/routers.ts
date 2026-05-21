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
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";

import { PluginService } from "@sola_mpd/shared/src/models/plugin/plugin_service_pb.js";

import { syncWithSubsonic } from "./application/subsonicUseCases.js";
import {
	SUBSONIC_PLUGIN_PARAMETER_KEYS,
	SUBSONIC_REQUEST_PARAMETER_KEYS,
	SUBSONIC_REQUIRED_PLUGIN_PARAMETERS,
	SUBSONIC_REQUIRED_REQUEST_PARAMETERS,
} from "./const/parameters.js";
import { SubsonicApiHttp } from "./services/SubsonicApiHttp.js";

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
					supportedTypes: [Plugin_PluginType.ON_ALL],
					requiredPluginParameters: [...SUBSONIC_REQUIRED_PLUGIN_PARAMETERS],
					requiredRequestParameters: [...SUBSONIC_REQUIRED_REQUEST_PARAMETERS],
				}),
			});
		},

		async *execute(
			req: PluginExecuteRequest,
		): AsyncGenerator<PluginExecuteResponse, void, unknown> {
			try {
				const url = req.pluginParameters[SUBSONIC_PLUGIN_PARAMETER_KEYS.url];
				const user = req.pluginParameters[SUBSONIC_PLUGIN_PARAMETER_KEYS.user];
				const password =
					req.pluginParameters[SUBSONIC_PLUGIN_PARAMETER_KEYS.password];
				const playlistName =
					req.requestParameters[SUBSONIC_REQUEST_PARAMETER_KEYS.playlistName];
				const songs = req.songs;
				const client = new SubsonicApiHttp(url, user, password);
				for await (const resp of syncWithSubsonic(
					client,
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
