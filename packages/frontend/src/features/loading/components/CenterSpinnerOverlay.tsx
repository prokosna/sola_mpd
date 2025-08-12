import { Center, LoadingOverlay } from "@mantine/core";
import type { ReactNode } from "react";

export interface CenterSpinnerOverlayProps {
	children: ReactNode;
	visible: boolean;
	color?: string;
	size?: number;
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
 * @param props.children The child component to display
 * @param props.color The color of the spinner
 * @param props.size The size of the spinner
 * @param props.type The type of the spinner
 */
export function CenterSpinnerOverlay(props: CenterSpinnerOverlayProps) {
	const params = Object.assign(
		{
			color: "brand",
			size: 72,
			type: undefined,
			visible: true,
		},
		props,
	);

	return (
		<>
			<Center w="100%" h="100%" pos="relative">
				<LoadingOverlay
					visible={params.visible}
					loaderProps={{
						size: params.size,
						type: params.type,
						color: params.color,
					}}
				/>
				{props.children}
			</Center>
		</>
	);
}
