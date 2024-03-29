import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import {
  useResizablePane,
  useSearchLayoutState,
  useSaveLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { SearchContent } from "./SearchContent";
import { SearchNavigation } from "./SearchNavigation";

export function Search() {
  const searchLayout = useSearchLayoutState();
  const saveLayout = useSaveLayoutState();

  const { colorMode } = useColorMode();

  const onChangeWidth = useCallback(
    async (left: number | undefined) => {
      if (searchLayout === undefined) {
        return;
      }
      if (left === undefined) {
        return;
      }
      const newLayout = searchLayout.clone();
      newLayout.sidePaneWidth = left;
      saveLayout(newLayout);
    },
    [searchLayout, saveLayout],
  );

  const { isReady, leftPaneWidth, rightPaneWidth, onChange } = useResizablePane(
    searchLayout?.sidePaneWidth,
    onChangeWidth,
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
            onChange(sizes[0], sizes[1]);
          }}
        >
          <Allotment.Pane preferredSize={leftPaneWidth} minSize={200}>
            <SearchNavigation />
          </Allotment.Pane>
          <Allotment.Pane preferredSize={rightPaneWidth}>
            <SearchContent />
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
