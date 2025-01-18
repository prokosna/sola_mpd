import { Flex, Icon, Link, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
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
	icon: IconType;
	link: string;
	isSelected?: boolean;
	isCompact: boolean;
};

/**
 * Navigation item with icon and optional text.
 *
 * @param props See SideNavigationItemProps
 */
export function SideNavigationItem(props: SideNavigationItemProps) {
	const navigate = useNavigate();
	const incrementTransitionCounter = useIncrementTransitionCounter();

	const handleNavigation = (to: string) => {
		incrementTransitionCounter();
		navigate(to);
	};

	return (
		<Link
			onClick={(e) => {
				e.preventDefault();
				handleNavigation(props.link);
			}}
			style={{ textDecoration: "none" }}
		>
			<Flex
				align="center"
				p="4"
				borderRadius="lg"
				// biome-ignore lint/a11y/useSemanticElements: Using Chakra UI.
				role="group"
				cursor="pointer"
				bg={props.isSelected ? "brand.600" : undefined}
				color={props.isSelected ? "white" : undefined}
				_hover={{
					boxShadow: "0 0 0 1px var(--chakra-colors-brand-600)",
				}}
			>
				<Icon as={props.icon} mr={props.isCompact ? 0 : 4} fontSize="24" />
				{props.isCompact ? null : (
					<Text fontWeight={"medium"}>{props.name}</Text>
				)}
			</Flex>
		</Link>
	);
}
