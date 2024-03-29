import { Box, useColorMode } from "@chakra-ui/react";
import { ReactTree } from "@naisutech/react-tree";

import { FullWidthSkeleton } from "../../loading";
import { useCustomThemes } from "../hooks/useCustomThemes";
import { useFileExploreReactTreeProps } from "../hooks/useFileExploreReactTreeProps";

export function FileExploreNavigation() {
  const { nodes, onSelectFolder } = useFileExploreReactTreeProps();
  const customThemes = useCustomThemes();

  const { colorMode } = useColorMode();

  if (nodes === undefined) {
    return (
      <Box w="100%" h="100%" className="layout-border-top layout-border-left">
        <FullWidthSkeleton />
      </Box>
    );
  }

  return (
    <>
      <Box
        className="layout-border-top layout-border-left"
        w="100%"
        h="100%"
        overflowX={"clip"}
        overflowY={"auto"}
      >
        <ReactTree
          nodes={nodes}
          onToggleSelectedNodes={onSelectFolder}
          showEmptyItems={false}
          theme={colorMode === "light" ? "brand" : "brandDark"}
          themes={customThemes}
        />
      </Box>
    </>
  );
}
