import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { useEffect } from "react";

export function TopLoadingProgressBar() {
	useEffect(() => {
		nprogress.start();
		return () => {
			nprogress.reset();
		};
	}, []);

	return <NavigationProgress />;
}
