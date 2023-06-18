import { Box, Text } from "@chakra-ui/react";
import React from "react";

export default function BrandLogo() {
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
