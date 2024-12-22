import {
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Divider,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  ButtonGroup,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useCallback, useState } from "react";

import { usePluginState, useSavePluginState } from "../states/pluginState";

export type PluginAddModalRegisterProps = {
  pluginToAdd: Plugin;
  onCloseModal: () => void;
};

export function PluginAddModalRegister(props: PluginAddModalRegisterProps) {
  const { pluginToAdd, onCloseModal } = props;

  const toast = useToast();
  const [parameterValues, setParameterValues] = useState<Map<string, string>>(
    new Map(),
  );
  const pluginState = usePluginState();
  const setPluginState = useSavePluginState();

  const onRegisterPlugin = useCallback(() => {
    if (pluginState === undefined) {
      return;
    }

    parameterValues.forEach((value, key) => {
      pluginToAdd.pluginParameters[key] = value;
    });

    const newPluginState = pluginState.clone();
    newPluginState.plugins.push(pluginToAdd);
    setPluginState(newPluginState);

    toast({
      status: "success",
      title: "Plugin successfully added",
      description: `New plugin "${pluginToAdd.info?.name}" has been added.`,
    });

    onCloseModal();
  }, [
    pluginState,
    parameterValues,
    pluginToAdd,
    setPluginState,
    toast,
    onCloseModal,
  ]);

  return (
    <>
      <ModalHeader>
        {pluginToAdd.info?.name} {pluginToAdd.info?.version}
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>{pluginToAdd.info?.description}</Text>
        <Divider my={4}></Divider>
        {(pluginToAdd.info?.requiredPluginParameters || []).map((key) => (
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
      </ModalBody>
      <ModalFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" onClick={onRegisterPlugin}>
            Add
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
}
