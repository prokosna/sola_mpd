import { Box, RingProgress, Text } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { showPluginExecutionProgressActionAtom } from "../states/actions/showPluginExecutionProgressActionAtom";
import {
	pluginExecutionLatestResponseAtom,
	pluginExecutionPropsAtom,
} from "../states/atoms/pluginExecutionAtom";

export function PluginExecutionIndicator() {
	const { plugin } = useAtomValue(pluginExecutionPropsAtom);
	const latestResponse = useAtomValue(pluginExecutionLatestResponseAtom);
	const showPluginExecutionProgress = useSetAtom(
		showPluginExecutionProgressActionAtom,
	);

	if (plugin === undefined) {
		return null;
	}

	return (
		<Box
			style={{ cursor: "pointer" }}
			onClick={() => showPluginExecutionProgress()}
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
