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
import type { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import {
	usePluginExecutionLatestResponseState,
	usePluginExecutionWarningLogsState,
	useSetIsPluginExecutionModalOpenState,
} from "../states/executionState";

type PluginExecutionModalProgressProps = {
	plugin: Plugin;
};

/**
 * Plugin execution progress view.
 *
 * Shows status, progress, and warnings.
 *
 * @param props.plugin Plugin being executed
 * @returns Progress view
 */
export function PluginExecutionModalProgress(
	props: PluginExecutionModalProgressProps,
) {
	const { plugin } = props;
	const latestResponse = usePluginExecutionLatestResponseState();
	const warningLogs = usePluginExecutionWarningLogsState();
	const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();

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
