import { ActionIcon, Tooltip } from "@mantine/core";

export type PlayerControlsButtonProps = {
	label: string;
	isDisabled: boolean;
	onButtonClicked: () => void | Promise<void>;
	icon: React.ReactElement;
	variant: string;
};

export function PlayerControlsButton(props: PlayerControlsButtonProps) {
	return (
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
	);
}
