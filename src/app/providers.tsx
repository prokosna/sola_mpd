"use client";
// https://chakra-ui.com/getting-started/nextjs-guide
import { ChakraProvider } from "@chakra-ui/react";

import { customTheme } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Issue: https://github.com/chakra-ui/chakra-ui/issues/7681#issuecomment-1584925964
    // <CacheProvider>
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
    // </CacheProvider>
  );
}
