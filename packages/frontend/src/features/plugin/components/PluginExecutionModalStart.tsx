import {
	Button,
	Divider,
	Group,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { useHandlePluginExecuted } from "../hooks/useHandlePluginExecuted";
import { closePluginExecutionModalActionAtom } from "../states/actions/closePluginExecutionModalActionAtom";
import { showPluginExecutionProgressActionAtom } from "../states/actions/showPluginExecutionProgressActionAtom";
import { isPreviousPluginStillRunningAtom } from "../states/atoms/pluginExecutionAtom";

type PluginExecutionModalStartProps = {
	plugin: Plugin;
	songs: Song[];
};

export function PluginExecutionModalStart(
	props: PluginExecutionModalStartProps,
) {
	const { plugin, songs } = props;

	const isPreviousPluginStillRunning = useAtomValue(
		isPreviousPluginStillRunningAtom,
	);
	const handlePluginExecuted = useHandlePluginExecuted();
	const closePluginExecutionModal = useSetAtom(
		closePluginExecutionModalActionAtom,
	);
	const showPluginExecutionProgress = useSetAtom(
		showPluginExecutionProgressActionAtom,
	);

	const [parameterValues, setParameterValues] = useState<Map<string, string>>(
		new Map(),
	);

	const onExecuted = useCallback(() => {
		handlePluginExecuted(plugin, songs, parameterValues);
		showPluginExecutionProgress();
	}, [
		handlePluginExecuted,
		parameterValues,
		plugin,
		songs,
		showPluginExecutionProgress,
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
					<Button color="gray" onClick={() => closePluginExecutionModal()}>
						Cancel
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
