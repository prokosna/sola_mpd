import { Box } from "@chakra-ui/react";

import { TreeView } from "../../../lib/chakra/components/TreeView";
import { FullWidthSkeleton } from "../../loading";
import { useFileExploreTreeViewNodes } from "../hooks/useFileExploreTreeViewNodes";

/**
 * Navigation component for the file explorer's folder tree.
 *
 * Features:
 * - Hierarchical folder structure display
 * - Interactive folder navigation
 * - Loading state handling
 * - Scrollable container
 * - Theme-aware styling
 *
 * Layout:
 * - Tree view for folder hierarchy
 * - Overflow handling for long lists
 * - Loading skeleton during data fetch
 *
 * @returns Rendered navigation component with tree view
 */
export function FileExploreNavigation() {
  const nodes = useFileExploreTreeViewNodes();

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
        overflowX="clip"
        overflowY="auto"
      >
        <TreeView {...{ nodes }} />
      </Box>
    </>
  );
}
