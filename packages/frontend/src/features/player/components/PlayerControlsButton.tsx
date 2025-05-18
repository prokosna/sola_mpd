import { IconButton } from "@chakra-ui/react";
import { Tooltip } from "../../../components/ui/tooltip";

export type PlayerControlsButtonProps = {
	label: string;
	isDisabled: boolean;
	onButtonClicked: () => Promise<void>;
	icon: React.ReactElement;
	variant: "solid" | "ghost";
};

/**
 * Base button component for player controls.
 *
 * Renders an icon button with tooltip, handling click events
 * and visual states. Used as a foundation for specific player
 * control buttons.
 *
 * @param props Button configuration and handlers
 * @returns Player control button with tooltip
 */
export function PlayerControlsButton(props: PlayerControlsButtonProps) {
	return (
		<>
			<Tooltip content={props.label} positioning={{ placement: "top" }}>
				<IconButton
					disabled={props.isDisabled}
					onClick={props.onButtonClicked}
					variant={props.variant}
					colorScheme="brand"
					aria-label={props.label}
					size={"md"}
					m={1}
				>
					{props.icon}
				</IconButton>
			</Tooltip>
		</>
	);
}
