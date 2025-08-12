import { Box, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import { useCallback } from "react";

import { UpdateMode } from "../../../types/stateTypes";
import {
	useResizablePane,
	useSearchLayoutState,
	useUpdateLayoutState,
} from "../../layout";
import { CenterSpinner } from "../../loading";

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
	const searchLayout = useSearchLayoutState();
	const updateLayout = useUpdateLayoutState();

	const { colorMode } = useColorMode();

	const handlePanelWidthChanged = useCallback(
		async (left: number | undefined) => {
			if (left === undefined || searchLayout === undefined) {
				return;
			}
			const newLayout = searchLayout.clone();
			newLayout.sidePaneWidth = left;
			updateLayout(newLayout, UpdateMode.PERSIST);
		},
		[searchLayout, updateLayout],
	);

	const { isReady, leftPaneWidthStyle, handlePanelResize } = useResizablePane(
		searchLayout?.sidePaneWidth,
		handlePanelWidthChanged,
	);

	if (!isReady) {
		return <CenterSpinner className="layout-border-top layout-border-left" />;
	}

	return (
		<>
			<Box w="100%" h="100%">
				<Allotment
					className={
						colorMode === "light" ? "allotment-light" : "allotment-dark"
					}
					onChange={(sizes) => {
						handlePanelResize(sizes[0], sizes[1]);
					}}
				>
					<Allotment.Pane preferredSize={leftPaneWidthStyle}>
						<SearchNavigation />
					</Allotment.Pane>
					<Allotment.Pane>
						<SearchContent />
					</Allotment.Pane>
				</Allotment>
			</Box>
		</>
	);
}
