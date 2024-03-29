import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import {
  useResizablePane,
  usePlaylistLayoutState,
  useSaveLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { PlaylistContent } from "./PlaylistContent";
import { PlaylistNavigation } from "./PlaylistNavigation";

export function Playlist() {
  const playlistLayout = usePlaylistLayoutState();
  const saveLayout = useSaveLayoutState();

  const { colorMode } = useColorMode();

  const onChangeWidth = useCallback(
    async (left: number | undefined) => {
      if (playlistLayout === undefined) {
        return;
      }
      if (left === undefined) {
        return;
      }
      const newLayout = playlistLayout.clone();
      newLayout.sidePaneWidth = left;
      saveLayout(newLayout);
    },
    [playlistLayout, saveLayout],
  );

  const { isReady, leftPaneWidth, rightPaneWidth, onChange } = useResizablePane(
    playlistLayout?.sidePaneWidth,
    onChangeWidth,
  );

  if (!isReady) {
    return (
      <Box w="100%" h="100%" className="layout-border-top layout-border-left">
        <CenterSpinner />
      </Box>
    );
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
            <PlaylistNavigation />
          </Allotment.Pane>
          <Allotment.Pane preferredSize={rightPaneWidth}>
            <PlaylistContent />
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
