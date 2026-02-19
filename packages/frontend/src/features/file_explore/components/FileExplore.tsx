import { Box } from "@mantine/core";
import clsx from "clsx";
import {
	Panel,
	Group as PanelGroup,
	Separator,
	useDefaultLayout,
} from "react-resizable-panels";
import styles from "../../../ResizeHandle.module.css";
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
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "file-explore",
		storage: globalThis.localStorage,
	});

	return (
		<Box w="100%" h="100%">
			<PanelGroup
				orientation="horizontal"
				defaultLayout={defaultLayout}
				onLayoutChanged={onLayoutChanged}
			>
				<Panel defaultSize="30%" minSize="10%" id="file-explore-navigation">
					<FileExploreNavigation />
				</Panel>
				<Separator className={clsx(styles.handle, styles.vertical)} />
				<Panel minSize="10%" id="file-explore-content">
					<FileExploreContent />
				</Panel>
			</PanelGroup>
		</Box>
	);
}
