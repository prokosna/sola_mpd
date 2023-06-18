"use client";
// https://chakra-ui.com/getting-started/nextjs-guide
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";

import { customTheme } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
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
    </CacheProvider>
  );
}
