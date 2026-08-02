import { useMemo } from "react";

import { BrowserView } from "../../common/components/BrowserView";
import { RecentlyAddedContent } from "./RecentlyAddedContent";
import { RecentlyAddedNavigation } from "./RecentlyAddedNavigation";
import { RecentlyAddedNavigationBreadcrumbs } from "./RecentlyAddedNavigationBreadcrumbs";
import { RecentlyAddedSelectionObserver } from "./RecentlyAddedSelectionObserver";

export function RecentlyAdded() {
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
		<>
			<RecentlyAddedSelectionObserver />
			<BrowserView
				{...{
					browserNavigationBreadcrumbs,
					browserNavigation,
					browserContent,
				}}
			/>
		</>
	);
}
