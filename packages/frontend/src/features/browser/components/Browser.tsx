import { Box, VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import {
  useResizablePane,
  useBrowserLayoutState,
  useSaveLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { BrowserContent } from "./BrowserContent";
import { BrowserNavigation } from "./BrowserNavigation";
import { BrowserNavigationBreadcrumbs } from "./BrowserNavigationBreadcrumbs";

export function Browser() {
  const browserLayout = useBrowserLayoutState();
  const saveLayout = useSaveLayoutState();

  const { colorMode } = useColorMode();

  const onChangeWidth = useCallback(
    async (left: number) => {
      if (browserLayout === undefined) {
        return;
      }
      const newLayout = browserLayout.clone();
      newLayout.sidePaneWidth = left;
      saveLayout(newLayout);
    },
    [browserLayout, saveLayout],
  );

  const { isReady, leftPaneWidth, rightPaneWidth, onChange } = useResizablePane(
    browserLayout?.sidePaneWidth,
    onChangeWidth,
  );

  if (!isReady) {
    return <CenterSpinner />;
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
              onChange(sizes[0], sizes[1]);
            }}
          >
            <Allotment.Pane preferredSize={leftPaneWidth} minSize={200}>
              <BrowserNavigation />
            </Allotment.Pane>
            <Allotment.Pane preferredSize={rightPaneWidth}>
              <BrowserContent />
            </Allotment.Pane>
          </Allotment>
        </Box>
      </VStack>
    </>
  );
}
