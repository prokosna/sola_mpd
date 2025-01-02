import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";
import type { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useCallback, useState } from "react";

import { PluginAddModalConnect } from "./PluginAddModalConnect";
import { PluginAddModalRegister } from "./PluginAddModalRegister";

export type PluginAddModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

/**
 * Modal for adding new plugins.
 *
 * Shows connection or registration view.
 *
 * @param props.isOpen Modal visibility
 * @param props.onClose Close handler
 * @returns Modal component
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
