import { Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
	const [isOpen, { open, close }] = useDisclosure();

	return (
		<>
			<Box w="100%" h="100%" p="30">
				<PluginList {...{ onOpen: open }} />
			</Box>
			<PluginAddModal {...{ isOpen, onClose: close }} />
		</>
	);
}
