import { create } from "@bufbuild/protobuf";
import type {
	Plugin,
	PluginExecuteResponse,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import {
	PluginExecuteRequestSchema,
	PluginExecuteResponse_Status,
	PluginExecuteResponseSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { PluginService } from "../services/PluginService";

export type PluginExecutionCallbacks = {
	onResponse: (resp: PluginExecuteResponse) => void;
	onWarning: (message: string) => void;
	onError: (error: Error) => void;
	onComplete: (resp: PluginExecuteResponse) => void;
};

export function buildPluginExecuteRequest(
	plugin: Plugin,
	songs: Song[],
	parameters: Map<string, string>,
) {
	const requestParameters: { [key: string]: string } = {};
	parameters.forEach((value, key) => {
		requestParameters[key] = value;
	});

	return create(PluginExecuteRequestSchema, {
		host: plugin.host,
		port: plugin.port,
		pluginParameters: plugin.pluginParameters,
		requestParameters,
		songs,
	});
}

export function createPluginExecutionCompleteResponse(
	songCount: number,
): PluginExecuteResponse {
	return create(PluginExecuteResponseSchema, {
		message: `Complete: Total ${songCount} songs`,
		progressPercentage: 100,
		status: PluginExecuteResponse_Status.OK,
	});
}

export function executePluginWithRouting(
	plugin: Plugin,
	songs: Song[],
	parameters: Map<string, string>,
	pluginService: PluginService,
	callbacks: PluginExecutionCallbacks,
): void {
	const req = buildPluginExecuteRequest(plugin, songs, parameters);

	const observable = pluginService.execute(req);
	observable.subscribe({
		next: (resp: PluginExecuteResponse) => {
			if (resp.status === PluginExecuteResponse_Status.WARN) {
				callbacks.onWarning(resp.message);
			}
			callbacks.onResponse(resp);
		},
		error: (err) => {
			const e = err instanceof Error ? err : new Error(String(err));
			callbacks.onError(e);
		},
		complete: () => {
			callbacks.onComplete(createPluginExecutionCompleteResponse(songs.length));
		},
	});
}
