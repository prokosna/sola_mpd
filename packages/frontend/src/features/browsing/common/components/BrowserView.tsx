import {
	Divider,
	Group as MantineGroup,
	Stack,
	useComputedColorScheme,
} from "@mantine/core";
import clsx from "clsx";
import type { JSX, ReactElement } from "react";
import {
	Group,
	Panel,
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
		storage: localStorage,
	});

	return (
		<Stack h="100%" gap={0}>
			<MantineGroup w="100%" bg={scheme === "light" ? "white" : "dark.7"}>
				{props.browserNavigationBreadcrumbs}
			</MantineGroup>
			<Divider />
			<MantineGroup w="100%" h="100%">
				<Group
					id="browser-view"
					orientation="horizontal"
					defaultLayout={defaultLayout}
					onLayoutChanged={onLayoutChanged}
				>
					<Panel id="browser-navigation" defaultSize="20%" minSize="10%">
						{props.browserNavigation}
					</Panel>
					<Separator className={clsx(styles.handle, styles.vertical)} />
					<Panel id="browser-content" minSize="20%">
						{props.browserContent}
					</Panel>
				</Group>
			</MantineGroup>
		</Stack>
	);
}
