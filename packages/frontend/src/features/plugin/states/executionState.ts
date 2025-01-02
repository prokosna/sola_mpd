import type { PluginExecuteResponse } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";

import type { PluginExecutionProps } from "../types/plugin";

/**
 * Plugin execution modal state.
 */
const isPluginExecutionModalOpenAtom = atom<"start" | "progress" | "closed">(
	"closed",
);

/**
 * Plugin execution properties.
 */
const pluginExecutionPropsAtom = atom<PluginExecutionProps>({
	plugin: undefined,
	songs: [],
});

/**
 * Latest execution response.
 */
const pluginExecutionLatestResponseAtom = atom<
	PluginExecuteResponse | Error | undefined
>(undefined);

/**
 * Execution warning logs.
 */
const pluginExecutionWarningLogsAtom = atom<string[]>([]);

/**
 * Atom for appending new warning logs.
 *
 * This atom provides a way to add new warning messages
 * while preserving the existing log history.
 */
const appendPluginExecutionWarningLogAtom = atom(
	null,
	(get, set, newLog: string) => {
		const currentLogs = get(pluginExecutionWarningLogsAtom);
		const updatedLogs = [...currentLogs, newLog];
		set(pluginExecutionWarningLogsAtom, updatedLogs);
	},
);

/**
 * Get execution properties.
 *
 * @returns Current properties
 */
export function usePluginExecutionPropsState() {
	return useAtomValue(pluginExecutionPropsAtom);
}

/**
 * Set execution properties.
 *
 * @returns Properties setter
 */
export function useSetPluginExecutionPropsState() {
	return useSetAtom(pluginExecutionPropsAtom);
}

/**
 * Get execution modal state.
 *
 * @returns Modal state
 */
export function useIsPluginExecutionModalOpenState() {
	return useAtomValue(isPluginExecutionModalOpenAtom);
}

/**
 * Set execution modal state.
 *
 * @returns Modal state setter
 */
export function useSetIsPluginExecutionModalOpenState() {
	return useSetAtom(isPluginExecutionModalOpenAtom);
}

/**
 * Get latest execution response.
 *
 * @returns Latest response
 */
export function usePluginExecutionLatestResponseState() {
	return useAtomValue(pluginExecutionLatestResponseAtom);
}

/**
 * Set execution response.
 *
 * @returns Response setter
 */
export function useSetPluginExecutionLatestResponseState() {
	return useSetAtom(pluginExecutionLatestResponseAtom);
}

/**
 * Check if plugin is running.
 *
 * @returns True if running
 */
export function useIsPreviousPluginStillRunningState() {
	const latestResponse = useAtomValue(pluginExecutionLatestResponseAtom);
	if (latestResponse === undefined) {
		return false;
	}
	if (latestResponse instanceof Error) {
		return false;
	}
	return latestResponse.progressPercentage < 100;
}

/**
 * Get warning logs.
 *
 * @returns Warning messages
 */
export function usePluginExecutionWarningLogsState() {
	return useAtomValue(pluginExecutionWarningLogsAtom);
}

/**
 * Set warning logs.
 *
 * @returns Logs setter
 */
export function useSetPluginExecutionWarningLogsState() {
	return useSetAtom(pluginExecutionWarningLogsAtom);
}

/**
 * Append warning log.
 *
 * @returns Log appender
 */
export function useAppendPluginExecutionWarningLogState() {
	return useSetAtom(appendPluginExecutionWarningLogAtom);
}
