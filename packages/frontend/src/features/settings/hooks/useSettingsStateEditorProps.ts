import { Message } from "@bufbuild/protobuf";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { useCallback } from "react";

import { SettingsStatesEditorProps } from "../components/SettingsStatesEditor";

export function useSettingsStateEditorProps<T extends Message>(
  state: T | undefined,
  update: (newState: T) => Promise<void>,
  fromJson: (json: string) => T,
): [() => void, SettingsStatesEditorProps<T> | undefined] {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onSave = useCallback(
    async (newState: T) => {
      update(newState);
      toast({
        status: "success",
        title: "State successfully updated",
        description: "The state has been updated.",
      });
    },
    [toast, update],
  );

  if (state === undefined) {
    return [onOpen, undefined];
  }

  return [
    onOpen,
    {
      state,
      onSave,
      isOpen,
      onClose,
      fromJson,
    },
  ];
}
