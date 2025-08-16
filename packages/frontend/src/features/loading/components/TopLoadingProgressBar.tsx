import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { useEffect } from "react";

/**
 * A progress bar that appears at the top of the viewport to indicate loading.
 *
 * Features:
 * - Fixed position at the top of the viewport
 * - Indeterminate animation for ongoing processes
 * - Full viewport width coverage
 * - High z-index to stay above other content
 *
 * @component
 */
export function TopLoadingProgressBar() {
	useEffect(() => {
		nprogress.start();
		return () => {
			nprogress.reset();
		};
	}, []);

	return (
		<>
			<NavigationProgress />
		</>
	);
}
