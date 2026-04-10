import { Modal } from "@mantine/core";
import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
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

	const handleModalClosed = useCallback(() => {
		setPluginToAdd(undefined);
		onClose();
	}, [onClose]);

	return (
		<Modal
			opened={isOpen}
			onClose={handleModalClosed}
			size={"lg"}
			centered
			title="Register Plugin"
		>
			{pluginToAdd === undefined ? (
				<PluginAddModalConnect {...{ setPluginToAdd }} />
			) : (
				<PluginAddModalRegister {...{ pluginToAdd, handleModalClosed }} />
			)}
		</Modal>
	);
}
