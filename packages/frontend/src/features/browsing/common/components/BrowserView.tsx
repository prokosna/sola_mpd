import { Allotment } from "allotment";
import { type ReactElement, useCallback } from "react";

import { UpdateMode } from "../../../../types/stateTypes";
import { useResizablePane } from "../../../layout";
import { CenterSpinner } from "../../../loading";

import { Divider, Group, Stack, useComputedColorScheme } from "@mantine/core";
import type {
	BrowserLayout,
	FileExploreLayout,
	LayoutState,
	PlaylistLayout,
	RecentlyAddedLayout,
	SearchLayout,
} from "@sola_mpd/domain/src/models/layout_pb.js";

type BrowserViewProps = {
	layout?: BrowserLayout | RecentlyAddedLayout;
	updateLayout: (
		layout:
			| FileExploreLayout
			| SearchLayout
			| BrowserLayout
			| PlaylistLayout
			| RecentlyAddedLayout
			| LayoutState,
		mode: UpdateMode,
	) => Promise<void>;
	browserNavigationBreadcrumbs: ReactElement;
	browserNavigation: ReactElement;
	browserContent: ReactElement;
};

/**
 * Renders the browser view component.
 *
 * This component displays the main browser interface, including navigation breadcrumbs,
 * navigation panel, and content area. It handles layout adjustments and updates.
 *
 * @param props The properties passed to the BrowserView component
 * @returns A React component representing the browser view
 */
export function BrowserView(props: BrowserViewProps) {
	const layout = props.layout;
	const updateLayout = props.updateLayout;

	const scheme = useComputedColorScheme();

	const handlePanelWidthChanged = useCallback(
		async (left: number | undefined) => {
			if (left === undefined || layout === undefined) {
				return;
			}
			const newLayout = layout.clone();
			newLayout.sidePaneWidth = left;
			updateLayout(newLayout, UpdateMode.PERSIST);
		},
		[layout, updateLayout],
	);

	const { isReady, leftPaneWidthStyle, handlePanelResize } = useResizablePane(
		layout?.sidePaneWidth,
		handlePanelWidthChanged,
	);

	if (!isReady) {
		return <CenterSpinner />;
	}

	return (
		<>
			<Stack h="100%" gap={0}>
				<Group
					w="100%"
					bg={scheme.colorScheme === "light" ? "white" : "dark.7"}
				>
					{props.browserNavigationBreadcrumbs}
				</Group>
				<Divider />
				<Group w="100%" h="100%">
					<Allotment
						className={
							scheme === "light" ? "allotment-light" : "allotment-dark"
						}
						onChange={(sizes) => {
							handlePanelResize(sizes[0], sizes[1]);
						}}
					>
						<Allotment.Pane preferredSize={leftPaneWidthStyle}>
							{props.browserNavigation}
						</Allotment.Pane>
						<Allotment.Pane>{props.browserContent}</Allotment.Pane>
					</Allotment>
				</Group>
			</Stack>
		</>
	);
}
