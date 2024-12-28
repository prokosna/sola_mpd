import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
  useResizablePane,
  usePlaylistLayoutState,
  useUpdateLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { PlaylistContent } from "./PlaylistContent";
import { PlaylistNavigation } from "./PlaylistNavigation";

/**
 * Playlist component that renders the playlist view.
 * It manages the layout of the playlist navigation and content,
 * and handles resizing of the panes.
 *
 * @returns The rendered Playlist component
 */
export function Playlist() {
  const playlistLayout = usePlaylistLayoutState();
  const updateLayout = useUpdateLayoutState();

  const { colorMode } = useColorMode();

  const handlePanelWidthChanged = useCallback(
    async (left: number | undefined) => {
      if (left === undefined) {
        return;
      }
      const newLayout = playlistLayout.clone();
      newLayout.sidePaneWidth = left;
      updateLayout(newLayout, UpdateMode.PERSIST);
    },
    [playlistLayout, updateLayout],
  );

  const {
    isReady,
    leftPaneWidthStyle,
    rightPaneWidthStyle,
    handlePanelResize,
  } = useResizablePane(playlistLayout?.sidePaneWidth, handlePanelWidthChanged);

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
            <PlaylistNavigation />
          </Allotment.Pane>
          <Allotment.Pane preferredSize={rightPaneWidthStyle}>
            <PlaylistContent />
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
