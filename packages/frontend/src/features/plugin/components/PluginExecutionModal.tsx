import { Modal } from "@mantine/core";
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
		<Modal
			opened={isPluginExecutionModalOpen !== "closed"}
			onClose={() => setIsPluginExecutionModalOpen("closed")}
			size={"xl"}
			centered
			title="Execute Plugin"
		>
			{isPluginExecutionModalOpen === "start" ? (
				<PluginExecutionModalStart {...{ plugin, songs }} />
			) : (
				<PluginExecutionModalProgress {...{ plugin }} />
			)}
		</Modal>
	);
}
