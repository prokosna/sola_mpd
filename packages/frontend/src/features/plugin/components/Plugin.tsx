import { Box, useDisclosure } from "@chakra-ui/react";

import { PluginAddModal } from "./PluginAddModal";
import { PluginList } from "./PluginList";

/**
 * Main plugin management component.
 *
 * Shows plugin list and add modal.
 *
 * @returns Plugin component
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
