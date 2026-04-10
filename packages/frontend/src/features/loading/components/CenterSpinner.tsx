import { Center, Loader } from "@mantine/core";

export interface CenterSpinnerProps {
	color?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	type?: "bars" | "dots";
}

export function CenterSpinner(props: CenterSpinnerProps) {
	const params = Object.assign(
		{
			color: "brand",
			size: "xl",
			type: undefined,
		},
		props,
	);

	return (
		<Center w="100%" h="100%">
			<Loader size={params.size} type={params.type} c={params.color} />
		</Center>
	);
}
