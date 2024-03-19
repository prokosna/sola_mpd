import { ChakraProvider } from "@chakra-ui/react";

import { customTheme } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider
      theme={customTheme}
      toastOptions={{
        defaultOptions: {
          status: "info",
          position: "bottom",
          duration: 5000,
          isClosable: true,
        },
      }}
    >
      {children}
    </ChakraProvider>
  );
}
