import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
  useResizablePane,
  useSearchLayoutState,
  useUpdateLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { SearchContent } from "./SearchContent";
import { SearchNavigation } from "./SearchNavigation";

/**
 * Search component that renders the search interface.
 * It manages the layout state and handles resizing of the search panes.
 * @returns JSX element representing the Search component
 */
export function Search() {
  const searchLayout = useSearchLayoutState();
  const updateLayout = useUpdateLayoutState();

  const { colorMode } = useColorMode();

  const handlePanelWidthChanged = useCallback(
    async (left: number | undefined) => {
      if (left === undefined) {
        return;
      }
      const newLayout = searchLayout.clone();
      newLayout.sidePaneWidth = left;
      updateLayout(newLayout, UpdateMode.PERSIST);
    },
    [searchLayout, updateLayout],
  );

  const {
    isReady,
    leftPaneWidthStyle,
    rightPaneWidthStyle,
    handlePanelResize,
  } = useResizablePane(searchLayout?.sidePaneWidth, handlePanelWidthChanged);

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
          <Allotment.Pane preferredSize={leftPaneWidthStyle} minSize={200}>
            <SearchNavigation />
          </Allotment.Pane>
          <Allotment.Pane preferredSize={rightPaneWidthStyle}>
            <SearchContent />
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
