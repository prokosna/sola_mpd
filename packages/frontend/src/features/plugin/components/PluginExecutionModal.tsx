import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";

import {
  useIsPluginExecutionModalOpenState,
  usePluginExecutionPropsState,
  useSetIsPluginExecutionModalOpenState,
} from "../states/execution";

import { PluginExecutionModalProgress } from "./PluginExecutionModalProgress";
import { PluginExecutionModalStart } from "./PluginExecutionModalStart";

export function PluginExecutionModal() {
  const isPluginExecutionModalOpen = useIsPluginExecutionModalOpenState();
  const { plugin, songs } = usePluginExecutionPropsState();
  const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();

  if (plugin === undefined) {
    return <></>;
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
