import {
	Badge,
	Button,
	Card,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import type { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useHandlePluginRemoved } from "../hooks/useHandlePluginRemoved";

export type PluginListInfoCardProps = {
	plugin: Plugin;
};

/**
 * Single plugin info card.
 *
 * @param props.plugin Plugin to display
 * @returns Info card
 */
export function PluginListInfoCard(props: PluginListInfoCardProps) {
	const { plugin } = props;

	const handlePluginRemoved = useHandlePluginRemoved(plugin);

	return (
		<Card w={320} h={350} withBorder>
			<Stack w="100%" h="100%">
				<Group>
					<Title size="h2">
						{plugin.info?.name} {plugin.info?.version}
					</Title>
					{plugin.isAvailable ? (
						<Badge size="xs" variant="outline" color="green">
							Avaialble
						</Badge>
					) : (
						<Badge size="xs" variant="outline" color="red">
							Not available
						</Badge>
					)}
				</Group>
				<Text c="brand">Endpoint: {`${plugin.host}:${plugin.port}`}</Text>
				<Divider />
				<Text
					size="md"
					style={{
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{plugin.info?.description}
				</Text>
				<Group mt="auto">
					<Button color="red" variant="outline" onClick={handlePluginRemoved}>
						Remove
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}
