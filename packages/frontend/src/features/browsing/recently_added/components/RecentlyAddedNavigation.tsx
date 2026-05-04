import { BrowserNavigationView } from "../../common/components/BrowserNavigationView";
import { useRecentlyAddedNavigationProps } from "../hooks/useRecentlyAddedNavigationProps";

export function RecentlyAddedNavigation() {
	const props = useRecentlyAddedNavigationProps();
	return <BrowserNavigationView {...props} />;
}
