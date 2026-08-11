import { atom } from "jotai";

import { pluginExecutionWarningLogsAtom } from "../atoms/pluginExecutionAtom";

export const clearPluginExecutionWarningLogsActionAtom = atom(
	null,
	(_get, set) => {
		set(pluginExecutionWarningLogsAtom, []);
	},
);
