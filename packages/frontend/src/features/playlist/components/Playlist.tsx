import { Box } from "@mantine/core";
import clsx from "clsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "../../../ResizeHandle.module.css";
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
	return (
		<Box w="100%" h="100%">
			<PanelGroup direction="horizontal" autoSaveId="playlist">
				<Panel defaultSize={30} minSize={10}>
					<PlaylistNavigation />
				</Panel>
				<PanelResizeHandle className={clsx(styles.handle, styles.vertical)} />
				<Panel minSize={30}>
					<PlaylistContent />
				</Panel>
			</PanelGroup>
		</Box>
	);
}
