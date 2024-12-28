import { Flex, Icon, Link, Text } from "@chakra-ui/react";
import { startTransition } from "react";
import { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";

export type SideNavigationItemProps = {
  name: string;
  icon: IconType;
  link: string;
  isSelected?: boolean;
  isCompact: boolean;
};

/**
 * Renders a navigation item for the side navigation.
 *
 * @param props - The properties for the SideNavigationItem component.
 * @param props.name - The display name of the navigation item.
 * @param props.icon - The icon component to be displayed.
 * @param props.link - The URL or path the item should navigate to when clicked.
 * @param props.isSelected - Optional. Indicates if the item is currently selected.
 * @param props.isCompact - Determines if the navigation item should be displayed in compact mode.
 * @returns A React component representing a side navigation item.
 */
export function SideNavigationItem(props: SideNavigationItemProps) {
  const navigate = useNavigate();

  const handleNavigation = (to: string) => {
    startTransition(() => {
      navigate(to);
    });
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
        role="group"
        cursor="pointer"
        bg={props.isSelected ? "brand.600" : undefined}
        color={props.isSelected ? "white" : undefined}
        _hover={{
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-600)",
        }}
      >
        <Icon as={props.icon} mr={props.isCompact ? 0 : 4} fontSize="24"></Icon>
        {props.isCompact ? null : (
          <Text fontWeight={"medium"}>{props.name}</Text>
        )}
      </Flex>
    </Link>
  );
}
