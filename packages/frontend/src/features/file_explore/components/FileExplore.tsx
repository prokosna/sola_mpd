import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
  useResizablePane,
  useFileExploreLayoutState,
  useUpdateLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { FileExploreContent } from "./FileExploreContent";
import { FileExploreNavigation } from "./FileExploreNavigation";

/**
 * FileExplore component for displaying and interacting with the file explorer.
 *
 * This component renders a resizable split view with a navigation pane on the left
 * and a content pane on the right. It uses the Allotment component for resizable panels
 * and manages the layout state for persisting panel sizes.
 *
 * @returns {JSX.Element} The rendered FileExplore component
 */
export function FileExplore() {
  const fileExploreLayout = useFileExploreLayoutState();
  const updateLayout = useUpdateLayoutState();

  const { colorMode } = useColorMode();

  const handlePanelWidthChanged = useCallback(
    async (left: number | undefined) => {
      if (left === undefined) {
        return;
      }
      const newLayout = fileExploreLayout.clone();
      newLayout.sidePaneWidth = left;
      updateLayout(newLayout, UpdateMode.PERSIST);
    },
    [fileExploreLayout, updateLayout],
  );

  const { isReady, leftPaneWidthStyle, handlePanelResize } = useResizablePane(
    fileExploreLayout?.sidePaneWidth,
    handlePanelWidthChanged,
  );

  if (!isReady) {
    return <CenterSpinner className="layout-border-top layout-border-left" />;
  }

  return (
    <>
      <Box w="100%" h="full">
        <Allotment
          className={
            colorMode === "light" ? "allotment-light" : "allotment-dark"
          }
          onChange={(sizes) => {
            handlePanelResize(sizes[0], sizes[1]);
          }}
        >
          <Allotment.Pane preferredSize={leftPaneWidthStyle}>
            <FileExploreNavigation />
          </Allotment.Pane>
          <Allotment.Pane>
            <FileExploreContent />
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
