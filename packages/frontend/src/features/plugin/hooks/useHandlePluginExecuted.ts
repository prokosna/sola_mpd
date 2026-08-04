import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { executePluginWithRouting } from "../functions/pluginExecutionRouting";
import { appendPluginExecutionWarningLogActionAtom } from "../states/actions/appendPluginExecutionWarningLogActionAtom";
import { clearPluginExecutionWarningLogsActionAtom } from "../states/actions/clearPluginExecutionWarningLogsActionAtom";
import { recordPluginExecutionResponseActionAtom } from "../states/actions/recordPluginExecutionResponseActionAtom";
import { pluginServiceAtom } from "../states/atoms/pluginServiceAtom";

export function useHandlePluginExecuted() {
	const pluginService = useAtomValue(pluginServiceAtom);
	const recordPluginExecutionResponse = useSetAtom(
		recordPluginExecutionResponseActionAtom,
	);
	const clearPluginExecutionWarningLogs = useSetAtom(
		clearPluginExecutionWarningLogsActionAtom,
	);
	const appendPluginExecutionWarningLog = useSetAtom(
		appendPluginExecutionWarningLogActionAtom,
	);

	return useCallback(
		(plugin: Plugin, songs: Song[], parameters: Map<string, string>) => {
			clearPluginExecutionWarningLogs();

			executePluginWithRouting(plugin, songs, parameters, pluginService, {
				onResponse: (resp) => {
					recordPluginExecutionResponse(resp);
				},
				onWarning: (message) => {
					appendPluginExecutionWarningLog(message);
				},
				onError: (error) => {
					recordPluginExecutionResponse(error);
				},
				onComplete: (resp) => {
					recordPluginExecutionResponse(resp);
				},
			});
		},
		[
			clearPluginExecutionWarningLogs,
			pluginService,
			recordPluginExecutionResponse,
			appendPluginExecutionWarningLog,
		],
	);
}
