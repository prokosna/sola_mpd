import {
	Button,
	Divider,
	Group,
	Progress,
	Stack,
	Text,
	Textarea,
	Title,
} from "@mantine/core";
import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import {
	pluginExecutionLatestResponseAtom,
	pluginExecutionModalOpenAtom,
	pluginExecutionWarningLogsAtom,
} from "../states/atoms/pluginExecutionAtom";

type PluginExecutionModalProgressProps = {
	plugin: Plugin;
};

export function PluginExecutionModalProgress(
	props: PluginExecutionModalProgressProps,
) {
	const { plugin } = props;
	const latestResponse = useAtomValue(pluginExecutionLatestResponseAtom);
	const warningLogs = useAtomValue(pluginExecutionWarningLogsAtom);
	const setIsPluginExecutionModalOpen = useSetAtom(
		pluginExecutionModalOpenAtom,
	);

	if (plugin.info === undefined) {
		return <Text>Invalid plugin: No information</Text>;
	}

	const error = latestResponse instanceof Error ? latestResponse : undefined;
	const response =
		latestResponse === undefined || latestResponse instanceof Error
			? undefined
			: latestResponse;

	return (
		<Stack gap={2}>
			<Title size="h2">{plugin.info.contextMenuTitle}</Title>
			{error === undefined ? (
				<Text
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{response?.message || "No plugin execution."}
				</Text>
			) : (
				<Text
					c="red"
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{error.message}
				</Text>
			)}
			<Progress
				striped={response?.progressPercentage !== 100}
				value={response?.progressPercentage || 0}
			/>
			<Divider my={3} />
			<Text>Warning logs</Text>
			<Textarea
				value={warningLogs.join("\n")}
				readOnly={true}
				autosize
				minRows={4}
				maxRows={4}
			/>
			<Group justify="flex-end">
				<Button
					variant="outline"
					onClick={() => setIsPluginExecutionModalOpen("closed")}
				>
					Dismiss
				</Button>
			</Group>
		</Stack>
	);
}
