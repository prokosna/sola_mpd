import { Box, RingProgress, Text } from "@mantine/core";
import { PluginExecuteResponse } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import {
	usePluginExecutionLatestResponseState,
	usePluginExecutionPropsState,
	useSetIsPluginExecutionModalOpenState,
} from "../states/executionState";

/**
 * Plugin execution progress indicator.
 *
 * Shows circular progress or error state.
 *
 * @returns Progress indicator or null
 */
export function PluginExecutionIndicator() {
	const { plugin } = usePluginExecutionPropsState();
	const latestResponse = usePluginExecutionLatestResponseState();
	const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();

	if (plugin === undefined) {
		return null;
	}

	return (
		<Box
			style={{ cursor: "pointer" }}
			onClick={() => setIsPluginExecutionModalOpen("progress")}
		>
			{latestResponse instanceof PluginExecuteResponse ? (
				<RingProgress
					size={48}
					thickness={4}
					sections={[
						{
							value: latestResponse.progressPercentage,
							color: "brand",
						},
					]}
					label={
						<Text size="xs" c="brand" ta="center">
							{latestResponse.progressPercentage}%
						</Text>
					}
				/>
			) : latestResponse instanceof Error ? (
				<RingProgress
					size={48}
					thickness={4}
					sections={[
						{
							value: 100,
							color: "red",
						},
					]}
					label={
						<Text size="xs" c="red" ta="center">
							Error
						</Text>
					}
				/>
			) : null}
		</Box>
	);
}
