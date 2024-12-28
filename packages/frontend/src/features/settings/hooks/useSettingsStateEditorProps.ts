import { Message } from "@bufbuild/protobuf";
import { useDisclosure } from "@chakra-ui/react";
import { useCallback } from "react";

import { useNotification } from "../../../lib/chakra/hooks/useNotification";
import { SettingsStatesEditorProps } from "../components/SettingsStatesEditor";

/**
 * Custom hook for managing settings state editor properties.
 *
 * @template T - Type extending Message
 * @param state - The current state
 * @param update - Function to update the state
 * @param fromJson - Function to convert JSON string to state object
 * @returns A tuple containing a function to open the editor and the editor props
 */
export function useSettingsStateEditorProps<T extends Message>(
  state: T | undefined,
  update: (newState: T) => Promise<void>,
  fromJson: (json: string) => T,
): [() => void, SettingsStatesEditorProps<T> | undefined] {
  const notify = useNotification();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onSave = useCallback(
    async (newState: T) => {
      update(newState);
      notify({
        status: "success",
        title: "State successfully updated",
        description: "The state has been updated.",
      });
    },
    [notify, update],
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
