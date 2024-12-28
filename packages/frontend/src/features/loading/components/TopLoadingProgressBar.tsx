import { Box, Progress } from "@chakra-ui/react";

/**
 * Renders a top loading progress bar component.
 *
 * This component displays an indeterminate progress bar fixed at the top of the viewport,
 * indicating an ongoing loading process.
 *
 * @returns A React component that renders the top loading progress bar.
 */
export function TopLoadingProgressBar() {
  return (
    <>
      <Box width="100%" position="fixed" top="0" zIndex="1">
        <Progress isIndeterminate />
      </Box>
    </>
  );
}
