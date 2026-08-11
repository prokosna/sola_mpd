import type { PluginExecuteResponse } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { atom } from "jotai";

import { pluginExecutionLatestResponseAtom } from "../atoms/pluginExecutionAtom";

/** Progress, failure and completion all land in the same latest-report slot. */
export const recordPluginExecutionResponseActionAtom = atom(
	null,
	(_get, set, response: PluginExecuteResponse | Error) => {
		set(pluginExecutionLatestResponseAtom, response);
	},
);
