import {
	type Theme,
	colorSchemeDarkBlue,
	colorSchemeLightWarm,
	themeAlpine,
} from "ag-grid-community";
import { useMemo } from "react";

import { rgba, useComputedColorScheme, useMantineTheme } from "@mantine/core";

export function useAgGridTheme(): Theme {
	const schema = useComputedColorScheme();
	const theme = useMantineTheme();

	const agGridLightTheme = themeAlpine
		.withPart(colorSchemeLightWarm)
		.withParams({
			spacing: 4,
			headerRowBorder: true,
			wrapperBorder: false,
			columnBorder: false,
			wrapperBorderRadius: 0,
			borderColor: theme.colors.gray[3],
			headerBackgroundColor: theme.colors.gray[2],
			backgroundColor: theme.white,
			oddRowBackgroundColor: theme.colors.gray[0],
			accentColor: rgba(theme.colors.brand[6], 0.5),
			rowHoverColor: rgba(theme.colors.brand[6], 0.15),
		});

	const agGridDarkTheme = themeAlpine.withPart(colorSchemeDarkBlue).withParams({
		spacing: 4,
		headerRowBorder: true,
		wrapperBorder: false,
		columnBorder: false,
		wrapperBorderRadius: 0,
		borderColor: theme.colors.dark[5],
		headerBackgroundColor: theme.colors.dark[6],
		backgroundColor: theme.colors.dark[7],
		oddRowBackgroundColor: theme.colors.dark[8],
		accentColor: rgba(theme.colors.brand[6], 0.5),
		rowHoverColor: rgba(theme.colors.brand[6], 0.15),
	});

	return useMemo(() => {
		return schema === "light" ? agGridLightTheme : agGridDarkTheme;
	}, [schema, agGridDarkTheme, agGridLightTheme]);
}
