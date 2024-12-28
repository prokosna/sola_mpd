import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";
import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useCallback, useState } from "react";

import { PluginAddModalConnect } from "./PluginAddModalConnect";
import { PluginAddModalRegister } from "./PluginAddModalRegister";

export type PluginAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * PluginAddModal component for adding new plugins.
 * It manages the state of the plugin being added and renders either
 * the connection or registration view based on that state.
 *
 * @param props - The props for the PluginAddModal component
 * @param props.isOpen - Boolean indicating if the modal is open
 * @param props.onClose - Function to call when closing the modal
 * @returns JSX element representing the PluginAddModal
 */
export function PluginAddModal(props: PluginAddModalProps) {
  const { isOpen, onClose } = props;
  const [pluginToAdd, setPluginToAdd] = useState<Plugin | undefined>(undefined);

  const handleModalClosed = useCallback(() => {
    setPluginToAdd(undefined);
    onClose();
  }, [onClose]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleModalClosed} size={"xl"} isCentered>
        <ModalOverlay />
        <ModalContent>
          {pluginToAdd === undefined ? (
            <PluginAddModalConnect {...{ setPluginToAdd }} />
          ) : (
            <PluginAddModalRegister {...{ pluginToAdd, handleModalClosed }} />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
