import { MantineProvider } from "@mantine/core";

import { Notifications } from "@mantine/notifications";
import { mantineTheme } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<MantineProvider theme={mantineTheme} defaultColorScheme="dark">
			<Notifications />
			{children}
		</MantineProvider>
	);
}
