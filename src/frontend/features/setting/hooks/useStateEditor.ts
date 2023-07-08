import { useDisclosure, useToast } from "@chakra-ui/react";
import { useCallback } from "react";

import { StateEditorProps } from "../components/StateEditor";

import { JSONSerializable } from "@/types/serialization";

export function useStateEditor<T>(
  state: T | undefined,
  stateType: JSONSerializable<T>,
  update: (newState: T) => Promise<void>,
) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const onSave = useCallback(
    async (newState: T) => {
      update(newState);
      toast({
        status: "success",
        title: "State updated",
        description: "Updates were successfully saved.",
      });
      onClose();
    },
    [onClose, toast, update],
  );

  if (state === undefined) {
    return {
      onOpen,
      props: undefined,
    };
  }

  const props: StateEditorProps<T> = {
    state,
    stateType,
    onSave,
    isOpen,
    onClose,
  };

  return {
    onOpen,
    props,
  };
}
