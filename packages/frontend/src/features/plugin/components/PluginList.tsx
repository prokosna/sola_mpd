import { CenterSpinner } from "../../loading";
import { usePluginState } from "../states/pluginState";

import { ActionIcon, Card, Center, Flex } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { PluginListInfoCard } from "./PluginListInfoCard";

type PluginListProps = {
	onOpen: () => void;
};

/**
 * Plugin list with add button.
 *
 * @param props.onOpen Add button click handler
 * @returns Plugin list view
 */
export function PluginList(props: PluginListProps) {
	const pluginState = usePluginState();

	if (pluginState === undefined) {
		return <CenterSpinner />;
	}

	return (
		<>
			<Flex gap={20} wrap="wrap">
				{pluginState.plugins.map((plugin) => (
					<PluginListInfoCard key={plugin.info?.name} {...{ plugin }} />
				))}
				<Card w={300} h={350} withBorder>
					<Center w="100%" h="100%">
						<ActionIcon size={48} variant="transparent" onClick={props.onOpen}>
							<IconPlus size={48} />
						</ActionIcon>
					</Center>
				</Card>
			</Flex>
		</>
	);
}
