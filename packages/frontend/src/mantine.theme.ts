import { DEFAULT_THEME, createTheme, mergeMantineTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./global.css";

export const mantineTheme = mergeMantineTheme(
	DEFAULT_THEME,
	createTheme({
		colors: {
			brand: DEFAULT_THEME.colors.blue,
		},
		primaryColor: "brand",
		autoContrast: true,
	}),
);
