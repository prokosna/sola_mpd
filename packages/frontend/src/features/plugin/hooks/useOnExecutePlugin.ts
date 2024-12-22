import {
  Plugin,
  PluginExecuteRequest,
  PluginExecuteResponse,
  PluginExecuteResponse_Status,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useCallback } from "react";

import {
  useSetPluginExecutionLatestResponseState,
  useSetPluginExecutionWarningLogsState,
  useAppendPluginExecutionWarningLogState,
} from "../states/execution";
import { usePluginService } from "../states/pluginService";

export function useOnExecutePlugin() {
  const pluginService = usePluginService();
  const setPluginExecutionLatestResponse =
    useSetPluginExecutionLatestResponseState();
  const setPluginExecutionWarningLogs = useSetPluginExecutionWarningLogsState();
  const appendPluginExecutionWarningLog =
    useAppendPluginExecutionWarningLogState();

  const onExecutePlugin = useCallback(
    (plugin: Plugin, songs: Song[], parameters: Map<string, string>) => {
      const requestParameters: { [key: string]: string } = {};
      parameters.forEach((value, key) => {
        requestParameters[key] = value;
      });

      const req = new PluginExecuteRequest({
        host: plugin.host,
        port: plugin.port,
        pluginParameters: plugin.pluginParameters,
        requestParameters,
        songs,
      });

      setPluginExecutionWarningLogs([]);

      const observable = pluginService.execute(req);
      observable.subscribe({
        next: (resp: PluginExecuteResponse) => {
          if (resp.status === PluginExecuteResponse_Status.WARN) {
            appendPluginExecutionWarningLog(resp.message);
          }
          setPluginExecutionLatestResponse(resp);
        },
        error: (err) => {
          const e = err instanceof Error ? err : new Error(String(err));
          setPluginExecutionLatestResponse(e);
        },
        complete: () => {
          setPluginExecutionLatestResponse(
            new PluginExecuteResponse({
              message: `Complete: Total ${songs.length} songs`,
              progressPercentage: 100,
              status: PluginExecuteResponse_Status.OK,
            }),
          );
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

  return onExecutePlugin;
}
