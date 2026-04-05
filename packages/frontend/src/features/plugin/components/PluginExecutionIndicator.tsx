import { Box, RingProgress, Text } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import {
	pluginExecutionLatestResponseAtom,
	pluginExecutionModalOpenAtom,
	pluginExecutionPropsAtom,
} from "../states/atoms/pluginExecutionAtom";

/**
 * Plugin execution progress indicator.
 *
 * Shows circular progress or error state.
 *
 * @returns Progress indicator or null
 */
export function PluginExecutionIndicator() {
	const { plugin } = useAtomValue(pluginExecutionPropsAtom);
	const latestResponse = useAtomValue(pluginExecutionLatestResponseAtom);
	const setIsPluginExecutionModalOpen = useSetAtom(
		pluginExecutionModalOpenAtom,
	);

	if (plugin === undefined) {
		return null;
	}

	return (
		<Box
			style={{ cursor: "pointer" }}
			onClick={() => setIsPluginExecutionModalOpen("progress")}
		>
			{latestResponse === undefined ? null : latestResponse instanceof Error ? (
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
			) : (
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
			)}
		</Box>
	);
}
