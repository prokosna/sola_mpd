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

export function usePluginExecutionPropsState() {
  return useAtomValue(pluginExecutionPropsAtom);
}

export function useSetPluginExecutionPropsState() {
  return useSetAtom(pluginExecutionPropsAtom);
}

export function useIsPluginExecutionModalOpenState() {
  return useAtomValue(isPluginExecutionModalOpenAtom);
}

export function useSetIsPluginExecutionModalOpenState() {
  return useSetAtom(isPluginExecutionModalOpenAtom);
}

export function usePluginExecutionLatestResponseState() {
  return useAtomValue(pluginExecutionLatestResponseAtom);
}

export function useSetPluginExecutionLatestResponseState() {
  return useSetAtom(pluginExecutionLatestResponseAtom);
}

export function useIsPreviousPluginStillRunningState() {
  const latestResponse = useAtomValue(pluginExecutionLatestResponseAtom);
  if (latestResponse === undefined) {
    return false;
  } else if (latestResponse instanceof Error) {
    return false;
  }
  return latestResponse.progressPercentage < 100;
}

export function usePluginExecutionWarningLogsState() {
  return useAtomValue(pluginExecutionWarningLogsAtom);
}

export function useSetPluginExecutionWarningLogsState() {
  return useSetAtom(pluginExecutionWarningLogsAtom);
}

export function useAppendPluginExecutionWarningLogState() {
  return useSetAtom(appendPluginExecutionWarningLogAtom);
}
