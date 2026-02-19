import { Box } from "@mantine/core";
import clsx from "clsx";
import {
	Panel,
	Group as PanelGroup,
	Separator,
	useDefaultLayout,
} from "react-resizable-panels";
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
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "playlist",
		storage: globalThis.localStorage,
	});

	return (
		<Box w="100%" h="100%">
			<PanelGroup
				orientation="horizontal"
				defaultLayout={defaultLayout}
				onLayoutChanged={onLayoutChanged}
			>
				<Panel defaultSize="30%" minSize="10%" id="playlist-navigation">
					<PlaylistNavigation />
				</Panel>
				<Separator className={clsx(styles.handle, styles.vertical)} />
				<Panel minSize="10%" id="playlist-content">
					<PlaylistContent />
				</Panel>
			</PanelGroup>
		</Box>
	);
}
