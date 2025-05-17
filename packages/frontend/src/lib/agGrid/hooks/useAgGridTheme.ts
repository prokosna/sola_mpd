import type { Theme } from "ag-grid-community";
import { useMemo } from "react";

import { useColorMode } from "../../../components/ui/color-mode";
import { agGridDarkTheme, agGridLightTheme } from "../agGridThemes";

export function useAgGridTheme(): Theme {
	const { colorMode } = useColorMode();

	return useMemo(() => {
		return colorMode === "light" ? agGridLightTheme : agGridDarkTheme;
	}, [colorMode]);
}
