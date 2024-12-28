import { PluginExecuteResponse } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { atom, useAtomValue, useSetAtom } from "jotai";

import { PluginExecutionProps } from "../types/plugin";

const isPluginExecutionModalOpenAtom = atom<"start" | "progress" | "closed">(
  "closed",
);

const pluginExecutionPropsAtom = atom<PluginExecutionProps>({
  plugin: undefined,
  songs: [],
});

const pluginExecutionLatestResponseAtom = atom<
  PluginExecuteResponse | Error | undefined
>(undefined);

const pluginExecutionWarningLogsAtom = atom<string[]>([]);

const appendPluginExecutionWarningLogAtom = atom(
  null,
  (get, set, newLog: string) => {
    const currentLogs = get(pluginExecutionWarningLogsAtom);
    const updatedLogs = [...currentLogs, newLog];
    set(pluginExecutionWarningLogsAtom, updatedLogs);
  },
);

/**
 * A hook that returns the current plugin execution props state.
 * @returns The current PluginExecutionProps state.
 */
export function usePluginExecutionPropsState() {
  return useAtomValue(pluginExecutionPropsAtom);
}

/**
 * A hook that returns a function to set the plugin execution props state.
 * @returns A function that updates the PluginExecutionProps state.
 */
export function useSetPluginExecutionPropsState() {
  return useSetAtom(pluginExecutionPropsAtom);
}

/**
 * A hook that returns the current state of the plugin execution modal.
 * @returns The current state of the plugin execution modal: "start", "progress", or "closed".
 */
export function useIsPluginExecutionModalOpenState() {
  return useAtomValue(isPluginExecutionModalOpenAtom);
}

/**
 * A hook that returns a function to set the state of the plugin execution modal.
 * @returns A function that updates the plugin execution modal state to "start", "progress", or "closed".
 */
export function useSetIsPluginExecutionModalOpenState() {
  return useSetAtom(isPluginExecutionModalOpenAtom);
}

/**
 * A hook that returns the latest response state of the plugin execution.
 * @returns The current PluginExecuteResponse, Error, or undefined if no execution has occurred.
 */
export function usePluginExecutionLatestResponseState() {
  return useAtomValue(pluginExecutionLatestResponseAtom);
}

/**
 * A hook that returns a function to set the latest response state of the plugin execution.
 * @returns A function that updates the latest response state with a PluginExecuteResponse or Error.
 */
export function useSetPluginExecutionLatestResponseState() {
  return useSetAtom(pluginExecutionLatestResponseAtom);
}

/**
 * A hook that returns whether a previous plugin execution is still running.
 * @returns A boolean indicating if a previous plugin is still running.
 */
export function useIsPreviousPluginStillRunningState() {
  const latestResponse = useAtomValue(pluginExecutionLatestResponseAtom);
  if (latestResponse === undefined) {
    return false;
  } else if (latestResponse instanceof Error) {
    return false;
  }
  return latestResponse.progressPercentage < 100;
}

/**
 * A hook that returns the current warning logs state of the plugin execution.
 * @returns An array of warning log messages.
 */
export function usePluginExecutionWarningLogsState() {
  return useAtomValue(pluginExecutionWarningLogsAtom);
}

/**
 * A hook that returns a function to set the warning logs state of the plugin execution.
 * @returns A function that updates the array of warning log messages.
 */
export function useSetPluginExecutionWarningLogsState() {
  return useSetAtom(pluginExecutionWarningLogsAtom);
}

/**
 * A hook that returns a function to append a new warning log to the plugin execution warning logs.
 * @returns A function that takes a string parameter and appends it to the existing warning logs.
 */
export function useAppendPluginExecutionWarningLogState() {
  return useSetAtom(appendPluginExecutionWarningLogAtom);
}
