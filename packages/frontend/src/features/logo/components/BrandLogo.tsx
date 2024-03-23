import { Box, Text } from "@chakra-ui/react";

export function BrandLogo() {
  return (
    <>
      <Box pl={6} m={0}>
        <Text className="logo-color" fontWeight={"bold"} fontSize={"3xl"}>
          Sola MPD
        </Text>
      </Box>
    </>
  );
}
