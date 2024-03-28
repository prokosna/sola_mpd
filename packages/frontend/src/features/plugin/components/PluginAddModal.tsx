import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";
import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useCallback, useState } from "react";

import { PluginAddModalConnect } from "./PluginAddModalConnect";
import { PluginAddModalRegister } from "./PluginAddModalRegister";

export type PluginAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PluginAddModal(props: PluginAddModalProps) {
  const { isOpen, onClose } = props;
  const [pluginToAdd, setPluginToAdd] = useState<Plugin | undefined>(undefined);

  const onCloseModal = useCallback(() => {
    setPluginToAdd(undefined);
    onClose();
  }, [onClose]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onCloseModal} size={"xl"} isCentered>
        <ModalOverlay />
        <ModalContent>
          {pluginToAdd === undefined ? (
            <PluginAddModalConnect {...{ setPluginToAdd }} />
          ) : (
            <PluginAddModalRegister {...{ pluginToAdd, onCloseModal }} />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
