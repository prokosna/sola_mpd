import type { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useCallback, useState } from "react";

import {
	Button,
	Divider,
	Group,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { usePluginState, useUpdatePluginState } from "../states/pluginState";

export type PluginAddModalRegisterProps = {
	pluginToAdd: Plugin;
	handleModalClosed: () => void;
};

/**
 * Plugin registration form.
 *
 * Shows info and handles registration.
 *
 * @param props.pluginToAdd Plugin to register
 * @param props.handleModalClosed Close handler
 * @returns Registration form
 */
export function PluginAddModalRegister(props: PluginAddModalRegisterProps) {
	const { pluginToAdd, handleModalClosed } = props;

	const notify = useNotification();

	const pluginState = usePluginState();
	const updatePluginState = useUpdatePluginState();

	const [parameterValues, setParameterValues] = useState<Map<string, string>>(
		new Map(),
	);

	const handlePluginRegistered = useCallback(() => {
		if (pluginState === undefined) {
			return;
		}

		parameterValues.forEach((value, key) => {
			pluginToAdd.pluginParameters[key] = value;
		});

		const newPluginState = pluginState.clone();
		newPluginState.plugins.push(pluginToAdd);
		updatePluginState(
			newPluginState,
			UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		);

		notify({
			status: "success",
			title: "Plugin successfully added",
			description: `New plugin "${pluginToAdd.info?.name}" has been added.`,
		});

		handleModalClosed();
	}, [
		pluginState,
		parameterValues,
		pluginToAdd,
		updatePluginState,
		notify,
		handleModalClosed,
	]);

	return (
		<>
			<form>
				<Stack gap={2}>
					<Title size="h2">
						{pluginToAdd.info?.name} {pluginToAdd.info?.version}
					</Title>
					<Text>{pluginToAdd.info?.description}</Text>
					<Divider my={4} />
					{(pluginToAdd.info?.requiredPluginParameters || []).map((key) => (
						<TextInput
							key={key}
							label={key}
							value={parameterValues.get(key) || ""}
							onChange={(e) => {
								const newValues = new Map(parameterValues);
								newValues.set(key, e.target.value);
								setParameterValues(newValues);
							}}
						/>
					))}
					<Group justify="flex-end">
						<Button onClick={handlePluginRegistered}>Add</Button>
					</Group>
				</Stack>
			</form>
		</>
	);
}
