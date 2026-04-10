import { NavLink } from "@mantine/core";
import { useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { incrementTransitionCounterActionAtom } from "../../location/states/actions/incrementTransitionCounterActionAtom";

export type SideNavigationItemProps = {
	name: string;
	icon: ReactNode;
	link: string;
	isSelected?: boolean;
	isCompact: boolean;
};

export function SideNavigationItem(props: SideNavigationItemProps) {
	const navigate = useNavigate();
	const incrementTransitionCounter = useSetAtom(
		incrementTransitionCounterActionAtom,
	);

	const handleNavigation = (to: string) => {
		incrementTransitionCounter();
		navigate(to);
	};

	return (
		<NavLink
			onClick={(e) => {
				e.preventDefault();
				handleNavigation(props.link);
			}}
			label={props.isCompact ? null : props.name}
			leftSection={props.icon}
			variant="fill"
			active={props.isSelected}
		/>
	);
}
