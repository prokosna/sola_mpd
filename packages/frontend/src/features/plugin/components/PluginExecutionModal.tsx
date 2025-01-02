import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";

import {
	useIsPluginExecutionModalOpenState,
	usePluginExecutionPropsState,
	useSetIsPluginExecutionModalOpenState,
} from "../states/executionState";

import { PluginExecutionModalProgress } from "./PluginExecutionModalProgress";
import { PluginExecutionModalStart } from "./PluginExecutionModalStart";

/**
 * Plugin execution modal.
 *
 * Shows start or progress view.
 *
 * @returns Modal or null
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
