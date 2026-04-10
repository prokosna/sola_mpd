import { useMemo } from "react";
import { BrowserView } from "../../common/components/BrowserView";
import { BrowserContent } from "./BrowserContent";
import { BrowserNavigation } from "./BrowserNavigation";
import { BrowserNavigationBreadcrumbs } from "./BrowserNavigationBreadcrumbs";

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
