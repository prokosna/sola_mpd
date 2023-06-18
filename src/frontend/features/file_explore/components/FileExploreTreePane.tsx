"use client";
import { Box, useToken } from "@chakra-ui/react";
import { ReactTree, ThemeSettings } from "@naisutech/react-tree";
import React from "react";

import { useFileExploreTreePane } from "../hooks/useFileExploreTreePane";

import FullWidthSkeleton from "@/frontend/common_ui/elements/FullWidthSkeleton";

export default function FileExploreTreePane() {
  const { data, onSongFoldersSelected } = useFileExploreTreePane();
  const [brand600] = useToken("colors", ["brand.600"]);

  const customThemes: ThemeSettings = {
    brand: {
      text: {
        fontSize: "std",
        color: "#000",
        selectedColor: "#333",
        hoverColor: "#555",
      },
      nodes: {
        height: "2.5rem",
        folder: {
          bgColor: "#fff",
          selectedBgColor: "#eee",
          hoverBgColor: "#ccc",
        },
        leaf: {
          bgColor: "#fff",
          selectedBgColor: "#eee",
          hoverBgColor: "#ccc",
        },
        separator: {
          border: "1px solid",
          borderColor: "#eee",
        },
        icons: {
          size: "1rem",
          folderColor: brand600,
          leafColor: "#64abd4",
        },
      },
    },
  };

  return (
    <>
      <Box
        w="100%"
        h="100%"
        borderTop={"1px solid"}
        borderLeft={"1px solid"}
        borderColor="gray.300"
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
            theme="brand"
            themes={customThemes}
          />
        )}
      </Box>
    </>
  );
}
