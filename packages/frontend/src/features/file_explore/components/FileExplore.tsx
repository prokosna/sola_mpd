import { Box } from "@mantine/core";
import clsx from "clsx";
import {
	Group,
	Panel,
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
		storage: localStorage,
	});

	return (
		<Box w="100%" h="100%">
			<Group
				id="file-explore"
				orientation="horizontal"
				defaultLayout={defaultLayout}
				onLayoutChanged={onLayoutChanged}
			>
				<Panel id="file-explore-navigation" defaultSize="20%" minSize="10%">
					<FileExploreNavigation />
				</Panel>
				<Separator className={clsx(styles.handle, styles.vertical)} />
				<Panel id="file-explore-content" minSize="20%">
					<FileExploreContent />
				</Panel>
			</Group>
		</Box>
	);
}
