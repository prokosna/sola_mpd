import { ActionIcon, Tooltip } from "@mantine/core";

export type PlayerControlsButtonProps = {
	label: string;
	isDisabled: boolean;
	onButtonClicked: () => Promise<void>;
	icon: React.ReactElement;
	variant: string;
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
			<Tooltip label={props.label} position="top" withArrow>
				<ActionIcon
					disabled={props.isDisabled}
					onClick={props.onButtonClicked}
					variant={props.variant}
					m={2}
				>
					{props.icon}
				</ActionIcon>
			</Tooltip>
		</>
	);
}
