import { accordionAnatomy } from "@chakra-ui/anatomy";
import {
  theme as baseTheme,
  createMultiStyleConfigHelpers,
  extendTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(accordionAnatomy.keys);

const brand = definePartsStyle({
  icon: {
    color: "brand.600",
  },
});

const accordionTheme = defineMultiStyleConfig({
  variants: { brand },
});

export const customTheme = extendTheme(
  {
    components: { Accordion: accordionTheme },

    colors: {
      brand: baseTheme.colors.blue,
      error: baseTheme.colors.red,
    },
  },
  withDefaultColorScheme({ colorScheme: "brand" }),
);
