import { useToken } from "@chakra-ui/react";
import { ThemeSettings } from "@naisutech/react-tree";

export function useCustomThemes() {
  const [brand600, gray800, gray300, gray600, brand50, brand100] = useToken(
    "colors",
    ["brand.600", "gray.800", "gray.300", "gray.600", "brand.50", "brand.100"],
  );

  const customThemes: ThemeSettings = {
    brand: {
      text: {
        fontSize: "std",
        color: "#000000",
        selectedColor: "#000000",
        hoverColor: "#000000",
      },
      nodes: {
        height: "2.5rem",
        folder: {
          bgColor: "#FFFFFF",
          selectedBgColor: brand100,
          hoverBgColor: brand50,
        },
        leaf: {
          bgColor: "#FFFFFF",
          selectedBgColor: brand100,
          hoverBgColor: brand50,
        },
        separator: {
          border: "1px solid",
          borderColor: gray300,
        },
        icons: {
          size: "1rem",
          folderColor: brand600,
          leafColor: brand600,
        },
      },
    },
    brandDark: {
      text: {
        fontSize: "std",
        color: "#FFFFFF",
        selectedColor: "#FFFFFF",
        hoverColor: "#FFFFFF",
      },
      nodes: {
        height: "2.5rem",
        folder: {
          bgColor: gray800,
          selectedBgColor: "#234C71",
          hoverBgColor: "#1A2C41",
        },
        leaf: {
          bgColor: gray800,
          selectedBgColor: "#234C71",
          hoverBgColor: "#1A2C41",
        },
        separator: {
          border: "1px solid",
          borderColor: gray600,
        },
        icons: {
          size: "1rem",
          folderColor: brand600,
          leafColor: brand600,
        },
      },
    },
  };

  return customThemes;
}
