import {
	Button,
	Divider,
	Group,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import type { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useCallback, useState } from "react";
import { useHandlePluginExecuted } from "../hooks/useHandlePluginExecuted";
import {
	useIsPreviousPluginStillRunningState,
	useSetIsPluginExecutionModalOpenState,
} from "../states/executionState";

type PluginExecutionModalStartProps = {
	plugin: Plugin;
	songs: Song[];
};

/**
 * Plugin execution start view.
 *
 * Handles parameter input and execution.
 *
 * @param props.plugin Target plugin
 * @param props.songs Songs to process
 * @returns Start view
 */
export function PluginExecutionModalStart(
	props: PluginExecutionModalStartProps,
) {
	const { plugin, songs } = props;

	const isPreviousPluginStillRunning = useIsPreviousPluginStillRunningState();
	const handlePluginExecuted = useHandlePluginExecuted();
	const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();

	const [parameterValues, setParameterValues] = useState<Map<string, string>>(
		new Map(),
	);

	const onExecuted = useCallback(() => {
		handlePluginExecuted(plugin, songs, parameterValues);
		setIsPluginExecutionModalOpen("progress");
	}, [
		handlePluginExecuted,
		parameterValues,
		plugin,
		songs,
		setIsPluginExecutionModalOpen,
	]);

	if (plugin.info === undefined) {
		return <Text>Invalid plugin: No information</Text>;
	}

	return (
		<form>
			<Stack gap={2}>
				<Title size="h2">{plugin.info.contextMenuTitle}</Title>

				{isPreviousPluginStillRunning ? (
					<Text c={"red"}>{"Previous plugin execution is still running."}</Text>
				) : (
					<>
						<Divider my={3} />
						{plugin.info.requiredRequestParameters.map((key) => (
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
					</>
				)}

				<Group justify="flex-end">
					<Button onClick={onExecuted} loading={isPreviousPluginStillRunning}>
						Execute
					</Button>
					<Button
						color="gray"
						onClick={() => setIsPluginExecutionModalOpen("closed")}
					>
						Cancel
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
