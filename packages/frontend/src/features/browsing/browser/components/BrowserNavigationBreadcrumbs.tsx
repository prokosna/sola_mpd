import { useAtomValue } from "jotai";

import { BrowserNavigationBreadcrumbsView } from "../../common/components/BrowserNavigationBreadcrumbsView";
import { useUpdateBrowserSelection } from "../hooks/useUpdateBrowserSelection";
import { browserSelectionAtom } from "../states/atoms/browserSelectionAtom";

export function BrowserNavigationBreadcrumbs() {
	const selection = useAtomValue(browserSelectionAtom);
	const updateSelection = useUpdateBrowserSelection();

	return (
		<BrowserNavigationBreadcrumbsView {...{ selection, updateSelection }} />
	);
}
