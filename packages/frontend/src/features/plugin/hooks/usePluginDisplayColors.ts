import { useColorModeValue } from "@chakra-ui/react";

/**
 * Custom hook to provide color values for plugin display elements.
 *
 * @returns An object containing color values for different plugin states and elements:
 *          - availableColor: Color for available plugins
 *          - unavailableColor: Color for unavailable plugins
 *          - endpointColor: Color for plugin endpoints
 *          - addPluginColor: Color for add plugin button
 */
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
