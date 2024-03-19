import {
  ModalHeader,
  ModalBody,
  Divider,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  ButtonGroup,
  Button,
  Text,
} from "@chakra-ui/react";
import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useCallback, useState } from "react";

import { useOnExecutePlugin } from "../hooks/useOnExecutePlugin";
import {
  useIsPreviousPluginStillRunningState,
  useSetIsPluginExecutionModalOpenState,
} from "../states/execution";

type PluginExecutionModalStartProps = {
  plugin: Plugin;
  songs: Song[];
};

export function PluginExecutionModalStart(
  props: PluginExecutionModalStartProps,
) {
  const { plugin, songs } = props;

  const [parameterValues, setParameterValues] = useState<Map<string, string>>(
    new Map(),
  );
  const onExecutePlugin = useOnExecutePlugin();
  const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();
  const isPreviousPluginStillRunning = useIsPreviousPluginStillRunningState();

  const onExecute = useCallback(() => {
    onExecutePlugin(plugin, songs, parameterValues);
    setIsPluginExecutionModalOpen("progress");
  }, [
    onExecutePlugin,
    parameterValues,
    plugin,
    songs,
    setIsPluginExecutionModalOpen,
  ]);

  if (plugin.info === undefined) {
    return <Text>Invalid plugin: No information</Text>;
  }

  return (
    <>
      <ModalHeader>{plugin.info.contextMenuTitle}</ModalHeader>
      <ModalBody>
        <Text>{plugin.info.contextMenuDescription}</Text>
        {isPreviousPluginStillRunning ? (
          <Text fontSize="md" color={"red"} py={2}>
            {"Previous plugin execution is still running."}
          </Text>
        ) : (
          <>
            <Divider my={3} />
            {plugin.info.requiredRequestParameters.map((key) => (
              <FormControl key={key}>
                <FormLabel>{key}</FormLabel>
                <Input
                  type="text"
                  value={parameterValues.get(key) || ""}
                  onChange={(e) => {
                    const newValues = new Map(parameterValues);
                    newValues.set(key, e.target.value);
                    setParameterValues(newValues);
                  }}
                ></Input>
              </FormControl>
            ))}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <ButtonGroup spacing="2">
          <Button onClick={onExecute} isLoading={isPreviousPluginStillRunning}>
            Execute
          </Button>
          <Button
            colorScheme="gray"
            variant="outline"
            onClick={() => setIsPluginExecutionModalOpen("closed")}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
}
