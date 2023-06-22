"use client";
import { Box, Text } from "@chakra-ui/react";
import React from "react";

import { useGlobalKeyShortcuts } from "../hooks/useGlobalKeyShortcuts";

export default function BrandLogo() {
  // Global stuff
  useGlobalKeyShortcuts();

  return (
    <>
      <Box pl={6} m={0}>
        <Text color={"brand.600"} fontWeight={"bold"} fontSize={"3xl"}>
          Sola MPD
        </Text>
      </Box>
    </>
  );
}
