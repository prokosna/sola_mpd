import { Box, useDisclosure } from "@chakra-ui/react";

import { PluginAddModal } from "./PluginAddModal";
import { PluginList } from "./PluginList";

/**
 * Plugin component that manages the display of plugins and the modal for adding new plugins.
 * It uses Chakra UI's useDisclosure hook to control the visibility of the add plugin modal.
 *
 * @returns JSX.Element The rendered Plugin component
 */
export function Plugin() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        className="layout-border-top layout-border-left"
        w="100%"
        h="full"
        p="30px"
      >
        <PluginList {...{ onOpen }} />
      </Box>
      <PluginAddModal {...{ isOpen, onClose }} />
    </>
  );
}
