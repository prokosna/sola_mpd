import {
  StyleFunctionProps,
  theme as baseTheme,
  extendTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const agGridColors = {
  activeColor: "#2196f3",
  hover: "rgba(33, 150, 243, 0.1)",
  selected: "rgba(33, 150, 243, 0.3)",
};

export const customTheme = extendTheme(
  {
    config: {
      initialColorMode: "dark",
    },
    semanticTokens: {
      colors: {
        "ag-grid.hover": agGridColors.hover,
        "ag-grid.selected": agGridColors.selected,
      },
    },
    components: {},
    colors: {
      brand: baseTheme.colors.blue,
      error: baseTheme.colors.red,
    },
    styles: {
      global: (props: StyleFunctionProps) => ({
        ".logo-color": {
          color: mode("brand.600", "brand.200")(props),
        },
        ".browser-breadcrumbs-bg": {
          bg: mode("brand.50", "brand.700")(props),
        },
        ".player-surface-grid": {
          bg: mode("brand.50", "brand.700")(props),
        },
        ".layout-border-all": {
          border: "1px solid",
          borderColor: mode("gray.300", "gray.600")(props),
        },
        ".layout-border-top": {
          borderTop: "1px solid",
          borderTopColor: mode("gray.300", "gray.600")(props),
        },
        ".layout-border-bottom": {
          borderBottom: "1px solid",
          borderBottomColor: mode("gray.300", "gray.600")(props),
        },
        ".layout-border-left": {
          borderLeft: "1px solid",
          borderLeftColor: mode("gray.300", "gray.600")(props),
        },
        ".layout-border-right": {
          borderRight: "1px solid",
          borderRightColor: mode("gray.300", "gray.600")(props),
        },
        ".browser-breadcrumbs-tag": {
          color: mode("brand.900", "brand.50")(props),
        },
        ".browser-breadcrumbs-tag-label": {
          color: mode("brand.900", "gray.50")(props),
        },
        ".layout-general-header-bg": {
          backgroundColor: mode("gray.50", "gray.700")(props),
        },
      }),
    },
  },
  withDefaultColorScheme({ colorScheme: "brand" }),
);
