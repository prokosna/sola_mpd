import type { PluginExecuteResponse } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { atom } from "jotai";

import type { PluginExecutionProps } from "../../types/plugin";

export const pluginExecutionModalOpenAtom = atom<
	"start" | "progress" | "closed"
>("closed");

export const pluginExecutionPropsAtom = atom<PluginExecutionProps>({
	plugin: undefined,
	songs: [],
});

export const pluginExecutionLatestResponseAtom = atom<
	PluginExecuteResponse | Error | undefined
>(undefined);

export const pluginExecutionWarningLogsAtom = atom<string[]>([]);

export const isPreviousPluginStillRunningAtom = atom((get) => {
	const latestResponse = get(pluginExecutionLatestResponseAtom);
	if (latestResponse === undefined) {
		return false;
	}
	if (latestResponse instanceof Error) {
		return false;
	}
	return latestResponse.progressPercentage < 100;
});
