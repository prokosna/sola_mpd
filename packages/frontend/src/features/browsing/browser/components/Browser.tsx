import { useMemo } from "react";
import { BrowserView } from "../../common/components/BrowserView";
import { BrowserContent } from "./BrowserContent";
import { BrowserNavigation } from "./BrowserNavigation";
import { BrowserNavigationBreadcrumbs } from "./BrowserNavigationBreadcrumbs";

/**
 * Browser component for displaying and managing music files.
 *
 * This component integrates the browser layout, navigation, and content.
 * It uses memoization to optimize rendering of child components.
 *
 * @returns The rendered Browser component
 */
export function Browser() {
	const browserNavigationBreadcrumbs = useMemo(() => {
		return <BrowserNavigationBreadcrumbs />;
	}, []);
	const browserNavigation = useMemo(() => {
		return <BrowserNavigation />;
	}, []);
	const browserContent = useMemo(() => {
		return <BrowserContent />;
	}, []);

	return (
		<BrowserView
			{...{
				browserNavigationBreadcrumbs,
				browserNavigation,
				browserContent,
			}}
		/>
	);
}
