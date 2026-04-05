import { create } from "@bufbuild/protobuf";
import {
	type Plugin,
	PluginExecuteRequestSchema,
	type PluginExecuteResponse,
	PluginExecuteResponse_Status,
	PluginExecuteResponseSchema,
} from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";

import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { appendPluginExecutionWarningLogActionAtom } from "../states/actions/appendPluginExecutionWarningLogActionAtom";
import {
	pluginExecutionLatestResponseAtom,
	pluginExecutionWarningLogsAtom,
} from "../states/atoms/pluginExecutionAtom";
import { pluginServiceAtom } from "../states/atoms/pluginServiceAtom";

/**
 * Handle plugin execution.
 *
 * Executes plugin with songs and parameters.
 *
 * @returns Plugin execution handler
 */
export function useHandlePluginExecuted() {
	const pluginService = useAtomValue(pluginServiceAtom);
	const setPluginExecutionLatestResponse = useSetAtom(
		pluginExecutionLatestResponseAtom,
	);
	const setPluginExecutionWarningLogs = useSetAtom(
		pluginExecutionWarningLogsAtom,
	);
	const appendPluginExecutionWarningLog = useSetAtom(
		appendPluginExecutionWarningLogActionAtom,
	);

	return useCallback(
		(plugin: Plugin, songs: Song[], parameters: Map<string, string>) => {
			const requestParameters: { [key: string]: string } = {};
			parameters.forEach((value, key) => {
				requestParameters[key] = value;
			});

			const req = create(PluginExecuteRequestSchema, {
				host: plugin.host,
				port: plugin.port,
				pluginParameters: plugin.pluginParameters,
				requestParameters,
				songs,
			});

			setPluginExecutionWarningLogs([]);

			const observable = pluginService.execute(req);
			observable.subscribe({
				next: (resp: PluginExecuteResponse) => {
					if (resp.status === PluginExecuteResponse_Status.WARN) {
						appendPluginExecutionWarningLog(resp.message);
					}
					setPluginExecutionLatestResponse(resp);
				},
				error: (err) => {
					const e = err instanceof Error ? err : new Error(String(err));
					setPluginExecutionLatestResponse(e);
				},
				complete: () => {
					setPluginExecutionLatestResponse(
						create(PluginExecuteResponseSchema, {
							message: `Complete: Total ${songs.length} songs`,
							progressPercentage: 100,
							status: PluginExecuteResponse_Status.OK,
						}),
					);
				},
			});
		},
		[
			setPluginExecutionWarningLogs,
			pluginService,
			setPluginExecutionLatestResponse,
			appendPluginExecutionWarningLog,
		],
	);
}
