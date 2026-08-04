import { Modal } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { closePluginExecutionModalActionAtom } from "../states/actions/closePluginExecutionModalActionAtom";
import {
	pluginExecutionModalOpenAtom,
	pluginExecutionPropsAtom,
} from "../states/atoms/pluginExecutionAtom";

import { PluginExecutionModalProgress } from "./PluginExecutionModalProgress";
import { PluginExecutionModalStart } from "./PluginExecutionModalStart";

export function PluginExecutionModal() {
	const { plugin, songs } = useAtomValue(pluginExecutionPropsAtom);
	const isPluginExecutionModalOpen = useAtomValue(pluginExecutionModalOpenAtom);
	const closePluginExecutionModal = useSetAtom(
		closePluginExecutionModalActionAtom,
	);

	if (plugin === undefined) {
		return null;
	}

	return (
		<Modal
			opened={isPluginExecutionModalOpen !== "closed"}
			onClose={() => closePluginExecutionModal()}
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
