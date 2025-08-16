import { Box } from "@mantine/core";
import clsx from "clsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "../../layout/components/ResizeHandle.module.css";
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
	return (
		<Box w="100%" h="100%">
			<PanelGroup direction="horizontal" autoSaveId="file-explore">
				<Panel defaultSize={30} minSize={10}>
					<FileExploreNavigation />
				</Panel>
				<PanelResizeHandle className={clsx(styles.handle, styles.vertical)} />
				<Panel minSize={30}>
					<FileExploreContent />
				</Panel>
			</PanelGroup>
		</Box>
	);
}
