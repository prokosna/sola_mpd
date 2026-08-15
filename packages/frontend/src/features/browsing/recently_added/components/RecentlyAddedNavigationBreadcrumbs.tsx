import { useAtomValue } from "jotai";

import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import { useUpdateRecentlyAddedSelection } from "../hooks/useUpdateRecentlyAddedSelection";
import { recentlyAddedSelectionAtom } from "../states/atoms/recentlyAddedSelectionAtom";

export function RecentlyAddedNavigationBreadcrumbs() {
	const selection = useAtomValue(recentlyAddedSelectionAtom);
	const updateSelection = useUpdateRecentlyAddedSelection();

	return (
		<BrowserNavigationBreadcrumbsView {...{ selection, updateSelection }} />
	);
}
