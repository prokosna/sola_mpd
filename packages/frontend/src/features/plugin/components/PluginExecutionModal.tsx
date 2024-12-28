import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";

import {
  useIsPluginExecutionModalOpenState,
  usePluginExecutionPropsState,
  useSetIsPluginExecutionModalOpenState,
} from "../states/executionState";

import { PluginExecutionModalProgress } from "./PluginExecutionModalProgress";
import { PluginExecutionModalStart } from "./PluginExecutionModalStart";

/**
 * PluginExecutionModal component
 *
 * This component renders a modal for plugin execution. It handles different
 * states of the execution process, showing either the start or progress view.
 * The modal's visibility is controlled by the plugin execution state.
 *
 * @returns The rendered modal or null if no plugin is selected
 */
export function PluginExecutionModal() {
  const { plugin, songs } = usePluginExecutionPropsState();
  const isPluginExecutionModalOpen = useIsPluginExecutionModalOpenState();
  const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();

  if (plugin === undefined) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen={isPluginExecutionModalOpen !== "closed"}
        onClose={() => setIsPluginExecutionModalOpen("closed")}
        size={"xl"}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          {isPluginExecutionModalOpen === "start" ? (
            <PluginExecutionModalStart {...{ plugin, songs }} />
          ) : (
            <PluginExecutionModalProgress {...{ plugin }} />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
