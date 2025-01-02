import { Box, SkeletonText } from "@chakra-ui/react";

/**
 * A skeleton loading placeholder that spans the full width of its container.
 *
 * Features:
 * - Shows 6 lines of animated loading placeholders
 * - Consistent spacing (4 units) between lines
 * - Uniform height (2 units) for each skeleton line
 * - Padding around content (6 units)
 * - Takes up full width and height of container
 *
 * @component
 * @param props.className Optional CSS class for styling the container
 */
export function FullWidthSkeleton({ className }: { className?: string }) {
  return (
    <>
      <Box w="100%" h="100%" p="6" className={className}>
        <SkeletonText mt="4" noOfLines={6} spacing="4" skeletonHeight="2" />
      </Box>
    </>
  );
}
