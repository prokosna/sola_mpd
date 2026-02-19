import { Box } from "@mantine/core";
import clsx from "clsx";
import {
	Panel,
	Group as PanelGroup,
	Separator,
	useDefaultLayout,
} from "react-resizable-panels";
import styles from "../../../ResizeHandle.module.css";
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
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "search",
		storage: globalThis.localStorage,
	});

	return (
		<Box w="100%" h="100%">
			<PanelGroup
				orientation="horizontal"
				defaultLayout={defaultLayout}
				onLayoutChanged={onLayoutChanged}
			>
				<Panel defaultSize="30%" minSize="10%" id="search-navigation">
					<SearchNavigation />
				</Panel>
				<Separator className={clsx(styles.handle, styles.vertical)} />
				<Panel minSize="10%" id="search-content">
					<SearchContent />
				</Panel>
			</PanelGroup>
		</Box>
	);
}
