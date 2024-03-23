import { Flex, Icon, Link, Text } from "@chakra-ui/react";
import { startTransition } from "react";
import { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";

export type SideNavigationItemProps = {
  name: string;
  icon: IconType;
  link: string;
  isSelected?: boolean;
};

export function SideNavigationItem(props: SideNavigationItemProps) {
  const navigate = useNavigate();

  const onNavigate = (to: string) => {
    startTransition(() => {
      navigate(to);
    });
  };

  return (
    <Link
      onClick={(e) => {
        e.preventDefault();
        onNavigate(props.link);
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
          border: "solid 1px",
          borderColor: "brand.600",
        }}
      >
        <Icon as={props.icon} mr="4" fontSize="24"></Icon>
        <Text fontWeight={"medium"}>{props.name}</Text>
      </Flex>
    </Link>
  );
}
