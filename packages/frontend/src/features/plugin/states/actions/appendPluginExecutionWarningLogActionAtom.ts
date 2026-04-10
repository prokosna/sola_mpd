import { atom } from "jotai";

import { pluginExecutionWarningLogsAtom } from "../atoms/pluginExecutionAtom";

export const appendPluginExecutionWarningLogActionAtom = atom(
	null,
	(get, set, newLog: string) => {
		const currentLogs = get(pluginExecutionWarningLogsAtom);
		set(pluginExecutionWarningLogsAtom, [...currentLogs, newLog]);
	},
);
