import { Box } from "@chakra-ui/react";

import { TreeView } from "../../../lib/chakra/components/TreeView";
import { FullWidthSkeleton } from "../../loading";
import { useFileExploreTreeViewNodes } from "../hooks/useFileExploreTreeViewNodes";

/**
 * FileExploreNavigation component for rendering the navigation tree in the file explorer.
 *
 * This component displays a hierarchical structure of folders using a custom tree view.
 * It handles folder selection and navigation through the file system.
 *
 * @returns {JSX.Element} The rendered FileExploreNavigation component
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
