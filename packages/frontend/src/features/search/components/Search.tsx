import { Box } from "@mantine/core";
import clsx from "clsx";
import {
	Group,
	Panel,
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
		storage: localStorage,
	});

	return (
		<Box w="100%" h="100%">
			<Group
				id="search"
				orientation="horizontal"
				defaultLayout={defaultLayout}
				onLayoutChanged={onLayoutChanged}
			>
				<Panel id="search-navigation" defaultSize="20%" minSize="10%">
					<SearchNavigation />
				</Panel>
				<Separator className={clsx(styles.handle, styles.vertical)} />
				<Panel id="search-content" minSize="20%">
					<SearchContent />
				</Panel>
			</Group>
		</Box>
	);
}
