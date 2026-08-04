import { atom } from "jotai";

import { pluginExecutionWarningLogsAtom } from "../atoms/pluginExecutionAtom";

/** Empties the warning log so a new run starts from a clean slate. */
export const clearPluginExecutionWarningLogsActionAtom = atom(
	null,
	(_get, set) => {
		set(pluginExecutionWarningLogsAtom, []);
	},
);
