import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react";
import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useRef } from "react";

import { useOnConnectPlugin } from "../hooks/useOnConnectPlugin";

export type PluginAddModalConnectProps = {
  setPluginToAdd: React.Dispatch<React.SetStateAction<Plugin | undefined>>;
};

export default function PluginAddModalConnect(
  props: PluginAddModalConnectProps,
) {
  const { setPluginToAdd } = props;

  const endpointRef = useRef<HTMLInputElement>(null);
  const { errorMessage, onConnect } = useOnConnectPlugin(
    endpointRef,
    setPluginToAdd,
  );

  return (
    <>
      <ModalHeader>Register Plugin</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl isInvalid={errorMessage !== ""}>
          <FormLabel>Endpoint</FormLabel>
          <Input type="text" placeholder="localhost:3001" ref={endpointRef} />
          {errorMessage !== "" ? (
            <FormErrorMessage>{errorMessage}</FormErrorMessage>
          ) : null}
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup spacing="2">
          <Button variant="outline" onClick={onConnect}>
            Connect
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
}
