import { Box, Progress } from "@chakra-ui/react";

export function TopLoadingProgressBar() {
  return (
    <>
      <Box width="100%" position="fixed" top="0" zIndex="1">
        <Progress isIndeterminate />
      </Box>
    </>
  );
}
