import { Box, Text } from "@chakra-ui/react";

import { useUserDeviceType } from "../../user_device";

export function BrandLogo() {
  const userDeviceType = useUserDeviceType();

  if (userDeviceType !== "large") {
    return null;
  }

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
