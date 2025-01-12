import {
	colorSchemeDarkBlue,
	colorSchemeLightWarm,
	themeAlpine,
} from "ag-grid-community";

const colorConversion = {
	gray50: "#f7fafc",
	gray300: "#cbd5e0",
	gray600: "#4a5568",
	gray700: "#2d3748",
	gray750: "#242c3a",
	gray800: "#1a202c",
};

export const agGridLightTheme = themeAlpine
	.withPart(colorSchemeLightWarm)
	.withParams({
		spacing: 4,
		borderColor: colorConversion.gray300,
		headerBackgroundColor: colorConversion.gray50,
	});

export const agGridDarkTheme = themeAlpine
	.withPart(colorSchemeDarkBlue)
	.withParams({
		spacing: 4,
		borderColor: colorConversion.gray600,
		headerBackgroundColor: colorConversion.gray700,
		backgroundColor: colorConversion.gray800,
		oddRowBackgroundColor: colorConversion.gray750,
	});
