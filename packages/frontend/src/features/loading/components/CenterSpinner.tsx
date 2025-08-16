import { Center, Loader } from "@mantine/core";

export interface CenterSpinnerProps {
	color?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	type?: "bars" | "dots";
}

/**
 * A component that displays a large, centered loading spinner.
 *
 * Features:
 * - Fixed size (24px) spinner with thick lines (6px)
 * - Uses brand color for consistency
 * - Centered both horizontally and vertically
 * - Takes up full width and height of container
 *
 * @component
 * @param props.color The color of the spinner
 * @param props.size The size of the spinner
 * @param props.type The type of the spinner
 */
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
