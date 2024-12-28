import { Box, useColorMode } from "@chakra-ui/react";
import { ReactTree } from "@naisutech/react-tree";

import { FullWidthSkeleton } from "../../loading";
import { useCustomThemes } from "../hooks/useCustomThemes";
import { useFileExploreReactTreeProps } from "../hooks/useFileExploreReactTreeProps";

/**
 * FileExploreNavigation component for rendering the navigation tree in the file explorer.
 *
 * This component uses the ReactTree to display a hierarchical structure of folders.
 * It handles folder selection and applies custom themes based on the current color mode.
 *
 * @returns {JSX.Element} The rendered FileExploreNavigation component
 */
export function FileExploreNavigation() {
  const { nodes, handleFolderSelected } = useFileExploreReactTreeProps();
  const customThemes = useCustomThemes();

  const { colorMode } = useColorMode();

  if (nodes === undefined) {
    return (
      <FullWidthSkeleton className="layout-border-top layout-border-left" />
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
          onToggleSelectedNodes={handleFolderSelected}
          showEmptyItems={false}
          theme={colorMode === "light" ? "brand" : "brandDark"}
          themes={customThemes}
        />
      </Box>
    </>
  );
}
