import { Box, VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
  useResizablePane,
  useBrowserLayoutState,
  useUpdateLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { BrowserContent } from "./BrowserContent";
import { BrowserNavigation } from "./BrowserNavigation";
import { BrowserNavigationBreadcrumbs } from "./BrowserNavigationBreadcrumbs";

/**
 * The main component of the browser feature.
 */
export function Browser() {
  const browserLayout = useBrowserLayoutState();
  const updateLayout = useUpdateLayoutState();

  const { colorMode } = useColorMode();

  const handlePanelWidthChanged = useCallback(
    async (left: number | undefined) => {
      if (left === undefined) {
        return;
      }
      const newLayout = browserLayout.clone();
      newLayout.sidePaneWidth = left;
      updateLayout(newLayout, UpdateMode.PERSIST);
    },
    [browserLayout, updateLayout],
  );

  const { isReady, leftPaneWidthStyle, handlePanelResize } = useResizablePane(
    browserLayout?.sidePaneWidth,
    handlePanelWidthChanged,
  );

  if (!isReady) {
    return <CenterSpinner className="layout-border-top layout-border-left" />;
  }

  return (
    <>
      <VStack h="full" spacing={0}>
        <Box className="browser-breadcrumbs-bg" w="100%">
          <BrowserNavigationBreadcrumbs />
        </Box>
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
              <BrowserNavigation />
            </Allotment.Pane>
            <Allotment.Pane>
              <BrowserContent />
            </Allotment.Pane>
          </Allotment>
        </Box>
      </VStack>
    </>
  );
}
