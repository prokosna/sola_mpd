import { Center, LoadingOverlay } from "@mantine/core";
import type { ReactNode } from "react";

export interface CenterSpinnerOverlayProps {
	children: ReactNode;
	visible: boolean;
	color?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	type?: "bars" | "dots";
}

export function CenterSpinnerOverlay(props: CenterSpinnerOverlayProps) {
	const params = Object.assign(
		{
			color: "brand",
			size: "xl",
			type: undefined,
			visible: true,
		},
		props,
	);

	return (
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
	);
}
