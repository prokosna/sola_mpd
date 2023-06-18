import {
  Button,
  ButtonGroup,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { produce } from "immer";
import React from "react";

import { usePluginExecutionModalLogic } from "../hooks/usePluginExecutionModalLogic";

import { Plugin } from "@/models/plugin/plugin";
import { Song } from "@/models/song";

export type PluginExecutionModalProps = {
  plugin: Plugin | undefined;
  isOpen: boolean;
  songs: Song[];
  onClose: () => void;
};

export default function PluginExecutionModal(props: PluginExecutionModalProps) {
  const { onClose, plugin, songs } = props;
  const {
    isInProgress,
    isFinished,
    parameters,
    setParameters,
    message,
    warningLogs,
    errorMessage,
    progress,
    execute,
    closeModal,
  } = usePluginExecutionModalLogic({
    onClose,
    plugin,
    songs,
  });

  if (plugin?.info === undefined || parameters === undefined) {
    return <></>;
  }

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={props.isOpen}
        onClose={closeModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          {!isInProgress ? (
            <>
              <ModalHeader>{plugin.info.contextMenuTitle}</ModalHeader>
              <ModalBody>
                <Text>{plugin.info.contextMenuDescription}</Text>
                <Divider my={3}></Divider>
                {plugin.info.requiredRequestParameters.map((param) => (
                  <FormControl key={param}>
                    <FormLabel>{param}</FormLabel>
                    <Input
                      type="text"
                      value={parameters[param] || ""}
                      onChange={(e) => {
                        const newParameters = produce(parameters, (draft) => {
                          draft[param] = e.target.value;
                        });
                        setParameters(newParameters);
                      }}
                    />
                  </FormControl>
                ))}
              </ModalBody>
              <ModalFooter>
                <ButtonGroup spacing="2">
                  <Button onClick={execute}>Execute</Button>
                  <Button
                    colorScheme="gray"
                    variant="outline"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>{plugin.info.contextMenuTitle}</ModalHeader>
              <ModalBody>
                {errorMessage === "" ? (
                  <Text>{message}</Text>
                ) : (
                  <Text color="red">{errorMessage}</Text>
                )}
                <Progress hasStripe={true} value={progress}></Progress>
                <Divider my={3}></Divider>
                <Text size="sm">Warning logs</Text>
                <Textarea
                  overflow={"auto"}
                  value={warningLogs.join("\n")}
                  readOnly={true}
                ></Textarea>
              </ModalBody>
              <ModalFooter>
                <ButtonGroup spacing="2">
                  <Button
                    variant="outline"
                    disabled={!isFinished}
                    onClick={closeModal}
                  >
                    Dismiss
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
