import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import type { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useRef } from "react";
import { useHandlePluginConnected } from "../hooks/useHandlePluginConnected";

export type PluginAddModalConnectProps = {
	setPluginToAdd: (plugin: Plugin | undefined) => void;
};

/**
 * Plugin connection form.
 *
 * Handles endpoint input and connection.
 *
 * @param props.setPluginToAdd Plugin setter
 * @returns Connection form
 */
export function PluginAddModalConnect(props: PluginAddModalConnectProps) {
	const { setPluginToAdd } = props;

	const endpointRef = useRef<HTMLInputElement>(null);
	const { errorMessage, handlePluginConnected } = useHandlePluginConnected(
		endpointRef,
		setPluginToAdd,
	);

	return (
		<form>
			<Stack gap={2}>
				<TextInput
					ref={endpointRef}
					withAsterisk
					label="Endpoint"
					placeholder="localhost:3001"
				/>
				{errorMessage !== "" && <Text c="red">{errorMessage}</Text>}

				<Group justify="flex-end">
					<Button onClick={handlePluginConnected}>Connect</Button>
				</Group>
			</Stack>
		</form>
	);
}
