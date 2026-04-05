import { Modal } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import {
	pluginExecutionModalOpenAtom,
	pluginExecutionPropsAtom,
} from "../states/atoms/pluginExecutionAtom";

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
	const { plugin, songs } = useAtomValue(pluginExecutionPropsAtom);
	const isPluginExecutionModalOpen = useAtomValue(pluginExecutionModalOpenAtom);
	const setIsPluginExecutionModalOpen = useSetAtom(
		pluginExecutionModalOpenAtom,
	);

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
