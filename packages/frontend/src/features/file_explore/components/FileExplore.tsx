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
