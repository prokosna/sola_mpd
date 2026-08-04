import type { PluginExecuteResponse } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { atom } from "jotai";

import { pluginExecutionLatestResponseAtom } from "../atoms/pluginExecutionAtom";

/**
 * Records what the plugin last reported. One action for all three outcomes
 * (progress, failure, completion) because the state is a single "latest
 * report" slot that isPreviousPluginStillRunningAtom derives from.
 */
export const recordPluginExecutionResponseActionAtom = atom(
	null,
	(_get, set, response: PluginExecuteResponse | Error) => {
		set(pluginExecutionLatestResponseAtom, response);
	},
);
