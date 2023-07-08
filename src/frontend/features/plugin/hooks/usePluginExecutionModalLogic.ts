import { produce } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSocket } from "../../global/hooks/useSocket";

import {
  Plugin,
  PluginExecuteRequest,
  PluginExecuteResponseStatus,
} from "@/models/plugin/plugin";
import { Song, SongList } from "@/models/song";
import { PluginUtils } from "@/utils/PluginUtils";

type PluginExecutionModalLogicProps = {
  onClose: () => void;
  plugin: Plugin | undefined;
  songs: Song[];
};

export function usePluginExecutionModalLogic(
  props: PluginExecutionModalLogicProps,
) {
  const { onClose, plugin, songs } = props;
  const socket = useSocket();

  const [isInProgress, setIsInProgress] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [parameters, setParameters] = useState({} as { [key: string]: string });
  const [message, setMessage] = useState("Executing...");
  const [warningLogs, setWarningLogs] = useState<string[]>([]);
  const warningLogsRef = useRef<string[]>([]);
  warningLogsRef.current = warningLogs;
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (plugin?.info === undefined) {
      return;
    }
    const initialParams = plugin.info.requiredRequestParameters.reduce(
      (acc, cur) => {
        acc[cur] = "";
        return acc;
      },
      {} as { [key: string]: string },
    );
    setParameters(initialParams);
  }, [plugin?.info]);

  const execute = useCallback(() => {
    if (socket === undefined || plugin === undefined) {
      return;
    }
    const payload = SongList.encode(SongList.create({ songs })).finish();
    const req = PluginExecuteRequest.create({
      host: plugin.host,
      port: plugin.port,
      pluginParameters: plugin.pluginParameters,
      requestParameters: parameters,
      payload,
    });
    const observable = PluginUtils.execute(socket, req);
    observable.subscribe({
      next: (resp) => {
        if (resp.status === PluginExecuteResponseStatus.OK) {
          setMessage(resp.message);
          setProgress(resp.progressPercentage);
        } else if (resp.status === PluginExecuteResponseStatus.WARN) {
          setMessage(resp.message);
          const newWarningLogs = produce(warningLogsRef.current, (draft) => {
            draft.push(resp.message);
          });
          setWarningLogs(newWarningLogs);
        }
      },
      error: (err) => {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(String(err));
        }
        setIsFinished(true);
      },
      complete: () => {
        setMessage("Completed");
        setProgress(100);
        setIsFinished(true);
      },
    });
    setIsInProgress(true);
  }, [parameters, plugin, socket, songs]);

  const closeModal = useCallback(() => {
    setIsInProgress(false);
    setIsFinished(false);
    setParameters({});
    setMessage("Executing...");
    setWarningLogs([]);
    setErrorMessage("");
    setProgress(0);
    onClose();
  }, [onClose]);

  return {
    isInProgress,
    isFinished,
    parameters,
    setParameters,
    message,
    warningLogs,
    progress,
    errorMessage,
    execute,
    closeModal,
  };
}
