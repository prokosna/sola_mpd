import { Button, Icon, useColorMode } from "@chakra-ui/react";
import { IoMoon, IoSunny } from "react-icons/io5";

/**
 * Light/dark mode toggle button.
 *
 * This component provides an intuitive interface for users to
 * switch between color modes, featuring dynamic icon switching
 * and smooth theme transitions.
 *
 * @component
 * @example
 * ```tsx
 * // In header or settings panel:
 * <ColorModeSwitchButton />
 * ```
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
