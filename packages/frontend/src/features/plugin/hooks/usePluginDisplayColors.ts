import { useColorModeValue } from "@chakra-ui/react";

export function usePluginDisplayColors() {
  const availableColor = useColorModeValue("brand.50", "brand.700");
  const unavailableColor = useColorModeValue("gray.50", "gray.600");
  const endpointColor = useColorModeValue("brand.600", "brand.300");
  const addPluginColor = useColorModeValue("gray.200", "gray.700");

  return {
    availableColor,
    unavailableColor,
    endpointColor,
    addPluginColor,
  };
}
