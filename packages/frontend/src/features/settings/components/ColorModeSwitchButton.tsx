import { Button, Icon, useColorMode } from "@chakra-ui/react";
import { IoMoon, IoSunny } from "react-icons/io5";

export function ColorModeSwitchButton() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <Button m={0} p={0} variant={"ghost"} onClick={toggleColorMode}>
        <Icon as={colorMode === "light" ? IoMoon : IoSunny} fontSize={24} />
      </Button>
    </>
  );
}
