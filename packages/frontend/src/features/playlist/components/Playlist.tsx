import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
	usePlaylistLayoutState,
	useResizablePane,
	useUpdateLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { PlaylistContent } from "./PlaylistContent";
import { PlaylistNavigation } from "./PlaylistNavigation";

/**
 * Main playlist component with resizable split pane layout.
 *
 * Provides navigation sidebar and content area for playlist
 * management. Persists layout state and pane widths.
 *
 * @returns Playlist view component
 */
export function Playlist() {
	const playlistLayout = usePlaylistLayoutState();
	const updateLayout = useUpdateLayoutState();

	const { colorMode } = useColorMode();

	const handlePanelWidthChanged = useCallback(
		async (left: number | undefined) => {
			if (left === undefined || playlistLayout === undefined) {
				return;
			}
			const newLayout = playlistLayout.clone();
			newLayout.sidePaneWidth = left;
			updateLayout(newLayout, UpdateMode.PERSIST);
		},
		[playlistLayout, updateLayout],
	);

	const { isReady, leftPaneWidthStyle, handlePanelResize } = useResizablePane(
		playlistLayout?.sidePaneWidth,
		handlePanelWidthChanged,
	);

	if (!isReady) {
		return <CenterSpinner className="layout-border-top layout-border-left" />;
	}

	return (
		<>
			<Box w="100%" h="100%">
				<Allotment
					className={
						colorMode === "light" ? "allotment-light" : "allotment-dark"
					}
					onChange={(sizes) => {
						handlePanelResize(sizes[0], sizes[1]);
					}}
				>
					<Allotment.Pane preferredSize={leftPaneWidthStyle}>
						<PlaylistNavigation />
					</Allotment.Pane>
					<Allotment.Pane>
						<PlaylistContent />
					</Allotment.Pane>
				</Allotment>
			</Box>
		</>
	);
}
