import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { executePluginWithRouting } from "../functions/pluginExecutionRouting";
import { appendPluginExecutionWarningLogActionAtom } from "../states/actions/appendPluginExecutionWarningLogActionAtom";
import {
	pluginExecutionLatestResponseAtom,
	pluginExecutionWarningLogsAtom,
} from "../states/atoms/pluginExecutionAtom";
import { pluginServiceAtom } from "../states/atoms/pluginServiceAtom";

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
			setPluginExecutionWarningLogs([]);

			executePluginWithRouting(plugin, songs, parameters, pluginService, {
				onResponse: (resp) => {
					setPluginExecutionLatestResponse(resp);
				},
				onWarning: (message) => {
					appendPluginExecutionWarningLog(message);
				},
				onError: (error) => {
					setPluginExecutionLatestResponse(error);
				},
				onComplete: (resp) => {
					setPluginExecutionLatestResponse(resp);
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
