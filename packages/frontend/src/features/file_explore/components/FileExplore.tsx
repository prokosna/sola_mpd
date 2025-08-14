import { Allotment } from "allotment";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
	useFileExploreLayoutState,
	useResizablePane,
	useUpdateLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

import { Box, useComputedColorScheme } from "@mantine/core";
import { FileExploreContent } from "./FileExploreContent";
import { FileExploreNavigation } from "./FileExploreNavigation";

/**
 * Main component for the file explorer feature.
 *
 * Features:
 * - Resizable split view layout
 * - Persistent panel size state
 * - Navigation pane with file system tree
 * - Content pane with file details
 * - Theme-aware styling
 * - Loading state handling
 *
 * Layout:
 * - Left: Navigation pane for browsing file system
 * - Right: Content pane for displaying file details and actions
 * - Draggable divider for resizing panes
 *
 * @returns Rendered file explorer component
 */
export function FileExplore() {
	const fileExploreLayout = useFileExploreLayoutState();
	const updateLayout = useUpdateLayoutState();

	const scheme = useComputedColorScheme();

	const handlePanelWidthChanged = useCallback(
		async (left: number | undefined) => {
			if (left === undefined || fileExploreLayout === undefined) {
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
		return <CenterSpinner />;
	}

	return (
		<>
			<Box w="100%" h="100%">
				<Allotment
					className={scheme === "light" ? "allotment-light" : "allotment-dark"}
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
