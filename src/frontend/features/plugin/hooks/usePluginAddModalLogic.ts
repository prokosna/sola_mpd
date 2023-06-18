import { useToast } from "@chakra-ui/react";
import { produce } from "immer";
import { useCallback, useState } from "react";

import { useSocket } from "../../global/hooks/useSocket";
import { useAppStore } from "../../global/store/AppStore";

import { usePluginState } from "./usePluginState";

import { Plugin, PluginRegisterRequest } from "@/models/plugin/plugin";
import { PluginUtils } from "@/utils/PluginUtils";

export function usePluginAddModalLogic(props: { onClose: () => void }) {
  const socket = useSocket();
  const pluginState = usePluginState();
  const updatePluginState = useAppStore((state) => state.updatePluginState);
  const toast = useToast();

  const [endpoint, setEndpoint] = useState("");
  const [inputErrorMessage, setInputErrorMessage] = useState("");

  const [plugin, setPlugin] = useState<Plugin>();
  const [parameterErrorMessages, setParameterErrorMessages] = useState<{
    [key: string]: string;
  }>({});

  const tryConnect = useCallback(async () => {
    if (endpoint.split(":").length !== 2) {
      setInputErrorMessage("Endpoint must be in the format: [IP]:[PORT]");
      return;
    }

    if (socket === undefined) {
      setInputErrorMessage("WebSocket is not ready.");
      return;
    }
    setInputErrorMessage("");

    const [host, port] = endpoint.split(":");
    const req = PluginRegisterRequest.create({ host, port: Number(port) });

    try {
      const resp = await PluginUtils.register(socket, req);
      if (resp.info === undefined) {
        setInputErrorMessage(
          "Plugin implementation is incorrect: info is undefined"
        );
        return;
      }
      setInputErrorMessage("");

      const params: { [key: string]: string } = {};
      resp.info.requiredPluginParameters.forEach((key) => {
        params[key] = "";
      });
      setPlugin({
        host,
        port: Number(port),
        info: resp.info,
        pluginParameters: params,
        isAvailable: true,
      });
    } catch (e) {
      if (e instanceof Error) {
        setInputErrorMessage(e.message);
      } else {
        setInputErrorMessage(String(e));
      }
      return;
    }
  }, [endpoint, socket]);

  const addPlugin = useCallback(() => {
    if (
      socket === undefined ||
      pluginState === undefined ||
      plugin === undefined
    ) {
      return;
    }
    const newParameterErrorMessages = produce(
      parameterErrorMessages,
      (draft) => {
        Object.entries(plugin.pluginParameters).forEach(([key, value]) => {
          if (value === "") {
            draft[key] = "This field is required.";
          } else {
            delete draft[key];
          }
        });
      }
    );
    if (Object.keys(newParameterErrorMessages).length > 0) {
      setParameterErrorMessages(newParameterErrorMessages);
      return;
    }

    const newPluginState = produce(pluginState, (draft) => {
      draft.plugins.push(plugin);
    });
    updatePluginState(socket, newPluginState);
    toast({
      status: "success",
      title: "Plugin added",
      description: `New plugin "${plugin.info?.name}" has been added.`,
    });
    props.onClose();
  }, [
    parameterErrorMessages,
    plugin,
    pluginState,
    props,
    socket,
    toast,
    updatePluginState,
  ]);

  const closeModal = useCallback(() => {
    setEndpoint("");
    setInputErrorMessage("");
    setPlugin(undefined);
    setParameterErrorMessages({});
    props.onClose();
  }, [props]);

  return {
    endpoint,
    setEndpoint,
    inputErrorMessage,
    parameterErrorMessages,
    plugin,
    setPlugin,
    tryConnect,
    addPlugin,
    closeModal,
  };
}
