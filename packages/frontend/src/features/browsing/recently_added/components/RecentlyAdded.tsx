import { useMemo } from "react";

import { BrowserView } from "../../common/components/BrowserView";
import { BrowsingSelectionObserver } from "../../common/components/BrowsingSelectionObserver";
import { restoreRecentlyAddedSelectionActionAtom } from "../states/actions/restoreRecentlyAddedSelectionActionAtom";
import { RecentlyAddedContent } from "./RecentlyAddedContent";
import { RecentlyAddedNavigation } from "./RecentlyAddedNavigation";
import { RecentlyAddedNavigationBreadcrumbs } from "./RecentlyAddedNavigationBreadcrumbs";

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
			<BrowsingSelectionObserver
				restoreSelectionActionAtom={restoreRecentlyAddedSelectionActionAtom}
			/>
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
