"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  Text,
} from "@chakra-ui/react";
import React, { useState, ChangeEvent, useEffect } from "react";

import { JSONSerializable } from "@/types/serialization";

export type StateEditorProps<T> = {
  state: T;
  stateType: JSONSerializable<T>;
  onSave: (state: T) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
};

export default function StateEditor<T>(props: StateEditorProps<T>) {
  const jsonText = JSON.stringify(props.stateType.toJSON(props.state), null, 2);
  const [value, setValue] = useState(jsonText);
  const [newState, setNewState] = useState<T>(props.state);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setValue(jsonText);
  }, [jsonText]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);

    let jsonObj;
    try {
      jsonObj = JSON.parse(inputValue);
    } catch (_) {
      setErrorMessage("Invalid JSON string");
      return;
    }
    setErrorMessage("");
    try {
      const newState = props.stateType.fromJSON(jsonObj);
      setErrorMessage("");
      setNewState(newState);
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
    }
  };

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Setting</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              h="300px"
              value={value}
              onChange={handleInputChange}
              size="sm"
            />
          </ModalBody>
          <Text fontSize="sm" colorScheme="red">
            {errorMessage}
          </Text>
          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                props.onSave(newState);
                props.onClose();
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
