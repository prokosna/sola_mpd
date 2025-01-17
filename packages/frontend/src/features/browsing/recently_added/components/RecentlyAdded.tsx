import { useMemo } from "react";
import {
	useRecentlyAddedLayoutState,
	useUpdateLayoutState,
} from "../../../layout";

import { BrowserView } from "../../common/components/BrowserView";
import { RecentlyAddedContent } from "./RecentlyAddedContent";
import { RecentlyAddedNavigation } from "./RecentlyAddedNavigation";
import { RecentlyAddedNavigationBreadcrumbs } from "./RecentlyAddedNavigationBreadcrumbs";

/**
 * Component for displaying recently added items.
 * Renders a browser view with navigation, breadcrumbs, and content for recently added items.
 * Uses layout state and update function for managing the component's layout.
 */
export function RecentlyAdded() {
	const recentlyAddedLayout = useRecentlyAddedLayoutState();
	const updateLayout = useUpdateLayoutState();

	const browserNavigationBreadcrumbs = useMemo(() => {
		return <RecentlyAddedNavigationBreadcrumbs />;
	}, []);
	const browserNavigation = useMemo(() => {
		return <RecentlyAddedNavigation />;
	}, []);
	const browserContent = useMemo(() => {
		return <RecentlyAddedContent />;
	}, []);

	return (
		<BrowserView
			{...{
				layout: recentlyAddedLayout,
				updateLayout,
				browserNavigationBreadcrumbs,
				browserNavigation,
				browserContent,
			}}
		/>
	);
}
