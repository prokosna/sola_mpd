import { ActionIcon, Card, Center, Flex } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { CenterSpinner } from "../../loading";
import { pluginAtom } from "../states/atoms/pluginAtom";
import { PluginListInfoCard } from "./PluginListInfoCard";

type PluginListProps = {
	onOpen: () => void;
};

export function PluginList(props: PluginListProps) {
	const pluginState = useAtomValue(pluginAtom);

	if (pluginState === undefined) {
		return <CenterSpinner />;
	}

	return (
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
	);
}
