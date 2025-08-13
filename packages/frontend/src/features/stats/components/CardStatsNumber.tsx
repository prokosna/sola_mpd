import { Card, Text } from "@mantine/core";

export type CardStatsNumberProps = {
	isSelected: boolean;
	label: string;
	count?: number | string;
};

/**
 * CardStatsNumber component displays a statistic with a label and count.
 * It can be styled differently when selected.
 *
 * @param props - The properties for the CardStatsNumber component
 * @param props.isSelected - Boolean indicating if the stat is selected
 * @param props.label - The label for the statistic
 * @param props.count - The count or value of the statistic (optional)
 * @returns A Stat component with label and count
 */
export function CardStatsNumber(props: CardStatsNumberProps) {
	return (
		<>
			<Card p={0} style={{ backgroundColor: "transparent" }}>
				<Text
					fz="xs"
					tt="uppercase"
					fw={700}
					c={props.isSelected ? "brand" : "dimmed"}
				>
					{props.label}
				</Text>
				<Text fz="lg" fw={500}>
					{props.count ?? "Loading..."}
				</Text>
			</Card>
		</>
	);
}
