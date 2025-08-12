import { NavLink } from "@mantine/core";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useIncrementTransitionCounter } from "../../location";

/**
 * Navigation item props.
 *
 * @property name Item text
 * @property icon Item icon
 * @property link Target path
 * @property isSelected Selection state
 * @property isCompact Compact mode flag
 */
export type SideNavigationItemProps = {
	name: string;
	icon: ReactNode;
	link: string;
	isSelected?: boolean;
	isCompact: boolean;
};

/**
 * Navigation item with icon and optional text.
 *
 * @param props See SideNavigationItemProps
 */
export function MantineSideNavigationItem(props: SideNavigationItemProps) {
	const navigate = useNavigate();
	const incrementTransitionCounter = useIncrementTransitionCounter();

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
