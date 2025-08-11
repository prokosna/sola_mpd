import { DEFAULT_THEME, createTheme, mergeMantineTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "./global.css";

export const mantineTheme = mergeMantineTheme(
	DEFAULT_THEME,
	createTheme({
		colors: {
			brand: [
				"rgba(239, 246, 255, 1)",
				"rgba(219, 234, 254, 1)",
				"rgba(191, 219, 254, 1)",
				"rgba(163, 207, 255, 1)",
				"rgba(96, 165, 250, 1)",
				"rgba(59, 130, 246, 1)",
				"rgba(37, 99, 235, 1)",
				"rgba(23, 61, 166, 1)",
				"rgba(26, 52, 120, 1)",
				"rgba(20, 32, 74, 1)",
			],
			gray: [
				"rgba(250, 250, 250, 1)",
				"rgba(244, 244, 245, 1)",
				"rgba(228, 228, 231, 1)",
				"rgba(212, 212, 216, 1)",
				"rgba(161, 161, 170, 1)",
				"rgba(113, 113, 122, 1)",
				"rgba(82, 82, 91, 1)",
				"rgba(63, 63, 70, 1)",
				"rgba(39, 39, 42, 1)",
				"rgba(24, 24, 27, 1)",
			],
		},
		primaryColor: "brand",
		other: {
			agGrid: {
				hover: "rgba(33, 150, 243, 0.1)",
				selected: "rgba(33, 150, 243, 0.3)",
			},
		},
	}),
);
