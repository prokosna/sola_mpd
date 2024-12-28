import { Button, Icon, useColorMode } from "@chakra-ui/react";
import { IoMoon, IoSunny } from "react-icons/io5";

/**
 * A button component that toggles between light and dark color modes.
 * Uses Chakra UI's useColorMode hook to manage the color mode state.
 *
 * @returns A Button component with an icon that changes based on the current color mode.
 */
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
