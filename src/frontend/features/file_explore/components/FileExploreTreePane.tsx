"use client";
import { Box, useColorMode, useToken } from "@chakra-ui/react";
import { ReactTree, ThemeSettings } from "@naisutech/react-tree";
import React from "react";

import { useFileExploreTreePane } from "../hooks/useFileExploreTreePane";

import FullWidthSkeleton from "@/frontend/common_ui/elements/FullWidthSkeleton";

export default function FileExploreTreePane() {
  const { data, onSongFoldersSelected } = useFileExploreTreePane();
  const [brand600, gray800, gray300, gray600, brand50, brand100] = useToken(
    "colors",
    ["brand.600", "gray.800", "gray.300", "gray.600", "brand.50", "brand.100"],
  );
  const { colorMode } = useColorMode();

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

  return (
    <>
      <Box
        className="layout-border-top layout-border-left"
        w="100%"
        h="100%"
        overflowX={"clip"}
        overflowY={"auto"}
      >
        {data === undefined ? (
          <FullWidthSkeleton></FullWidthSkeleton>
        ) : (
          <ReactTree
            nodes={data}
            onToggleSelectedNodes={onSongFoldersSelected}
            showEmptyItems={false}
            theme={colorMode === "light" ? "brand" : "brandDark"}
            themes={customThemes}
          />
        )}
      </Box>
    </>
  );
}
