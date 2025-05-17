import {
	createSystem,
	defaultConfig,
	defineGlobalStyles,
} from "@chakra-ui/react";

const agGridColors = {
	activeColor: "#2196f3",
	hover: "rgba(33, 150, 243, 0.1)",
	selected: "rgba(33, 150, 243, 0.3)",
};

// Runtime guard for defaultConfig structure
if (
	!defaultConfig.theme ||
	!defaultConfig.theme.tokens ||
	!defaultConfig.theme.tokens.colors ||
	!defaultConfig.theme.tokens.colors.blue ||
	!defaultConfig.theme.tokens.colors.red ||
	!defaultConfig.theme.tokens.colors.gray
) {
	throw new Error(
		"Chakra UI defaultConfig is missing expected theme structure for colors. Check Chakra UI installation and version.",
	);
}

export const system = createSystem(defaultConfig, {
	theme: {
		tokens: {
			colors: {
				brand: defaultConfig.theme.tokens.colors.blue,
				error: defaultConfig.theme.tokens.colors.red,
				gray: defaultConfig.theme.tokens.colors.gray,
			},
		},
		semanticTokens: {
			colors: {
				"ag-grid.hover": { value: agGridColors.hover },
				"ag-grid.selected": { value: agGridColors.selected },
			},
		},
	},
});

export const globalStyles = defineGlobalStyles({
	".logo-color": {
		color: "brand.600",
		_dark: {
			color: "brand.200",
		},
	},
	".browser-breadcrumbs-bg": {
		bg: "brand.50",
		_dark: {
			bg: "brand.700",
		},
	},
	".player-surface-grid": {
		bg: "brand.50",
		_dark: {
			bg: "brand.700",
		},
	},
	".layout-border-all": {
		border: "1px solid",
		borderColor: "gray.300",
		_dark: {
			borderColor: "gray.600",
		},
	},
	".layout-border-top": {
		borderTop: "1px solid",
		borderTopColor: "gray.300",
		_dark: {
			borderTopColor: "gray.600",
		},
	},
	".layout-border-bottom": {
		borderBottom: "1px solid",
		borderBottomColor: "gray.300",
		_dark: {
			borderBottomColor: "gray.600",
		},
	},
	".layout-border-left": {
		borderLeft: "1px solid",
		borderLeftColor: "gray.300",
		_dark: {
			borderLeftColor: "gray.600",
		},
	},
	".layout-border-right": {
		borderRight: "1px solid",
		borderRightColor: "gray.300",
		_dark: {
			borderRightColor: "gray.600",
		},
	},
	".browser-breadcrumbs-tag": {
		color: "brand.900",
		_dark: {
			color: "brand.50",
		},
	},
	".browser-breadcrumbs-tag-label": {
		color: "brand.900",
		_dark: {
			color: "gray.50",
		},
	},
	".layout-general-header-bg": {
		backgroundColor: "gray.50",
		_dark: {
			backgroundColor: "gray.700",
		},
	},
});
