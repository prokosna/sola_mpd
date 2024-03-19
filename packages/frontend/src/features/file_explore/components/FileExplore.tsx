import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import {
  useResizablePane,
  useFileExploreLayoutState,
  useSaveLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { FileExploreContent } from "./FileExploreContent";
import { FileExploreNavigation } from "./FileExploreNavigation";

export function FileExplore() {
  const fileExploreLayout = useFileExploreLayoutState();
  const saveLayout = useSaveLayoutState();

  const { colorMode } = useColorMode();

  const onChangeWidth = useCallback(
    async (left: number) => {
      if (fileExploreLayout === undefined) {
        return;
      }
      const newLayout = fileExploreLayout.clone();
      newLayout.sidePaneWidth = left;
      saveLayout(newLayout);
    },
    [fileExploreLayout, saveLayout],
  );

  const { isReady, leftPaneWidth, rightPaneWidth, onChange } = useResizablePane(
    fileExploreLayout?.sidePaneWidth,
    onChangeWidth,
  );

  if (!isReady) {
    return <CenterSpinner />;
  }

  return (
    <>
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
            <FileExploreNavigation />
          </Allotment.Pane>
          <Allotment.Pane preferredSize={rightPaneWidth}>
            <FileExploreContent />
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
