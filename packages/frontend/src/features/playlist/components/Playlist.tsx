import { Box } from "@mantine/core";
import clsx from "clsx";
import {
	Group,
	Panel,
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
		storage: localStorage,
	});

	return (
		<Box w="100%" h="100%">
			<Group
				id="playlist"
				orientation="horizontal"
				defaultLayout={defaultLayout}
				onLayoutChanged={onLayoutChanged}
			>
				<Panel id="playlist-navigation" defaultSize="20%" minSize="10%">
					<PlaylistNavigation />
				</Panel>
				<Separator className={clsx(styles.handle, styles.vertical)} />
				<Panel id="playlist-content" minSize="20%">
					<PlaylistContent />
				</Panel>
			</Group>
		</Box>
	);
}
