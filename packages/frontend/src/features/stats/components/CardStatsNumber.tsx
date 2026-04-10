import { Card, Text } from "@mantine/core";

export type CardStatsNumberProps = {
	isSelected: boolean;
	label: string;
	count?: number | string;
};

export function CardStatsNumber(props: CardStatsNumberProps) {
	return (
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
	);
}
