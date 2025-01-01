import { Box, VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
  useResizablePane,
  useUpdateLayoutState,
  useRecentlyAddedLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { RecentlyAddedContent } from "./RecentlyAddedContent";
import { RecentlyAddedNavigation } from "./RecentlyAddedNavigation";

/**
 * The main component of the recently added feature.
 */
export function RecentlyAdded() {
  const recentlyAddedLayout = useRecentlyAddedLayoutState();
  const updateLayout = useUpdateLayoutState();

  const { colorMode } = useColorMode();

  const handlePanelWidthChanged = useCallback(
    async (left: number | undefined) => {
      if (left === undefined || recentlyAddedLayout === undefined) {
        return;
      }
      const newLayout = recentlyAddedLayout.clone();
      newLayout.sidePaneWidth = left;
      updateLayout(newLayout, UpdateMode.PERSIST);
    },
    [recentlyAddedLayout, updateLayout],
  );

  const { isReady, leftPaneWidthStyle, handlePanelResize } = useResizablePane(
    recentlyAddedLayout?.sidePaneWidth,
    handlePanelWidthChanged,
  );

  if (!isReady) {
    return <CenterSpinner className="layout-border-top layout-border-left" />;
  }

  return (
    <>
      <VStack h="full" spacing={0}>
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
              <RecentlyAddedNavigation />
            </Allotment.Pane>
            <Allotment.Pane>
              <RecentlyAddedContent />
            </Allotment.Pane>
          </Allotment>
        </Box>
      </VStack>
    </>
  );
}
