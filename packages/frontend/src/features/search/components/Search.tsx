import { Box } from "@mantine/core";
import clsx from "clsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "../../layout/components/ResizeHandle.module.css";
import { SearchContent } from "./SearchContent";
import { SearchNavigation } from "./SearchNavigation";

/**
 * Main search interface component.
 *
 * Manages layout and pane resizing.
 *
 * @returns Search component
 */
export function Search() {
	return (
		<Box w="100%" h="100%">
			<PanelGroup direction="horizontal" autoSaveId="search">
				<Panel defaultSize={30} minSize={10}>
					<SearchNavigation />
				</Panel>
				<PanelResizeHandle className={clsx(styles.handle, styles.vertical)} />
				<Panel minSize={30}>
					<SearchContent />
				</Panel>
			</PanelGroup>
		</Box>
	);
}
