import { createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "./global.css";

export const mantineTheme = createTheme({
	primaryColor: "blue",
	other: {
		agGrid: {
			hover: "rgba(33, 150, 243, 0.1)",
			selected: "rgba(33, 150, 243, 0.3)",
		},
	},
});
