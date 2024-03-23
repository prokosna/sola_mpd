import {
  Plugin,
  PluginRegisterRequest,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { RefObject, useCallback, useState } from "react";

import { useSocketState } from "../../socketio";
import { registerPlugin } from "../helpers/socket";
import { validateIpAndPort } from "../helpers/validation";

export function useOnConnectPlugin(
  endpointRef: RefObject<HTMLInputElement>,
  setPluginToAdd: React.Dispatch<React.SetStateAction<Plugin | undefined>>,
) {
  const socket = useSocketState();
  const [errorMessage, setErrorMessage] = useState("");

  const onConnect = useCallback(async () => {
    const endpoint = endpointRef.current?.value;
    if (endpoint === undefined) {
      setErrorMessage("Endpoint is required.");
      return;
    }
    if (!validateIpAndPort(endpoint)) {
      setErrorMessage("Endpoint must be in the format: [IP]:[PORT]");
      return;
    }

    if (socket === undefined) {
      setErrorMessage(
        "Socket is not ready. Maybe reload the tab and try again.",
      );
      return;
    }
    setErrorMessage("");

    const [host, port] = endpoint.split(":");
    const req = new PluginRegisterRequest({ host, port: Number(port) });

    try {
      const resp = await registerPlugin(socket, req);
      if (resp.info === undefined) {
        setErrorMessage(
          "Plugin implementation is incorrect: info is undefined.",
        );
        return;
      }
      setErrorMessage("");

      setPluginToAdd(
        new Plugin({
          host,
          port: Number(port),
          info: resp.info,
          isAvailable: true,
        }),
      );
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      } else {
        setErrorMessage(String(e));
      }
      return;
    }
  }, [endpointRef, setPluginToAdd, socket]);

  return {
    errorMessage,
    onConnect,
  };
}
