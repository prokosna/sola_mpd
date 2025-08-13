import { DEFAULT_THEME, createTheme, mergeMantineTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./global.css";

export const mantineTheme = mergeMantineTheme(
	DEFAULT_THEME,
	createTheme({
		colors: {
			brand: [
				"#eff6ff",
				"#dbeafe",
				"#bfdbfe",
				"#a3cfff",
				"#60a5fa",
				"#3b82f6",
				"#2563eb",
				"#173da6",
				"#1a3478",
				"#14204a",
			],
		},
		primaryColor: "brand",
		autoContrast: true,
	}),
);
