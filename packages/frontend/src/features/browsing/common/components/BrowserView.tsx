import { Divider, Group, Stack, useComputedColorScheme } from "@mantine/core";
import clsx from "clsx";
import type { JSX, ReactElement } from "react";
import {
	Panel,
	Group as PanelGroup,
	Separator,
	useDefaultLayout,
} from "react-resizable-panels";
import styles from "../../../../ResizeHandle.module.css";

type BrowserViewProps = {
	browserNavigationBreadcrumbs: ReactElement;
	browserNavigation: JSX.Element;
	browserContent: JSX.Element;
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
	const scheme = useComputedColorScheme();
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "browser-view",
		storage: globalThis.localStorage,
	});

	return (
		<Stack h="100%" gap={0}>
			<Group w="100%" bg={scheme === "light" ? "white" : "dark.7"}>
				{props.browserNavigationBreadcrumbs}
			</Group>
			<Divider />
			<Group w="100%" h="100%">
				<PanelGroup
					orientation="horizontal"
					defaultLayout={defaultLayout}
					onLayoutChanged={onLayoutChanged}
				>
					<Panel defaultSize="30%" minSize="10%" id="browser-navigation">
						{props.browserNavigation}
					</Panel>
					<Separator className={clsx(styles.handle, styles.vertical)} />
					<Panel minSize="10%" id="browser-content">
						{props.browserContent}
					</Panel>
				</PanelGroup>
			</Group>
		</Stack>
	);
}
