import {
  Button,
  ButtonGroup,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { produce } from "immer";
import React from "react";

import { usePluginAddModalLogic } from "../hooks/usePluginAddModalLogic";

export type PluginAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PluginAddModal(props: PluginAddModalProps) {
  const {
    endpoint,
    setEndpoint,
    inputErrorMessage,
    parameterErrorMessages,
    plugin,
    setPlugin,
    tryConnect,
    addPlugin,
    closeModal,
  } = usePluginAddModalLogic({ onClose: props.onClose });

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={closeModal} size={"xl"} isCentered>
        <ModalOverlay />
        <ModalContent>
          {plugin === undefined ? (
            <>
              <ModalHeader>Add Plugin</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl isInvalid={inputErrorMessage !== ""}>
                  <FormLabel>Endpoint</FormLabel>
                  <Input
                    type="text"
                    placeholder="localhost:3001"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                  />
                  {inputErrorMessage !== "" ? (
                    <FormErrorMessage>{inputErrorMessage}</FormErrorMessage>
                  ) : undefined}
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <ButtonGroup spacing="2">
                  <Button variant="outline" onClick={tryConnect}>
                    Connect
                  </Button>
                </ButtonGroup>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>
                {plugin.info?.name} {plugin.info?.version}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>{plugin.info?.description}</Text>
                <Divider my={4}></Divider>
                {Object.entries(plugin.pluginParameters).map(([key, value]) => (
                  <FormControl
                    key={key}
                    isInvalid={parameterErrorMessages.hasOwnProperty(key)}
                  >
                    <FormLabel>{key}</FormLabel>
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        const newParams = produce(
                          plugin.pluginParameters,
                          (draft) => {
                            draft[key] = newValue;
                          },
                        );
                        const newPlugin = produce(plugin, (draft) => {
                          draft.pluginParameters = newParams;
                        });
                        setPlugin(newPlugin);
                      }}
                    ></Input>
                    {parameterErrorMessages.hasOwnProperty(key) ? (
                      <FormErrorMessage>
                        {parameterErrorMessages[key]}
                      </FormErrorMessage>
                    ) : undefined}
                  </FormControl>
                ))}
              </ModalBody>
              <ModalFooter>
                <ButtonGroup spacing="2">
                  <Button variant="solid" onClick={addPlugin}>
                    Add
                  </Button>
                </ButtonGroup>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
