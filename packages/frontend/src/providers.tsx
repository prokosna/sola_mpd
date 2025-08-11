import { ChakraProvider } from "@chakra-ui/react";
import { MantineProvider } from "@mantine/core";

import { mantineTheme } from "./mantine.theme";
import { customTheme } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<MantineProvider theme={mantineTheme} defaultColorScheme="dark">
			<ChakraProvider theme={customTheme}>{children}</ChakraProvider>
		</MantineProvider>
	);
}
