import { Box, SkeletonText } from "@chakra-ui/react";

/**
 * A component that renders a full-width skeleton loading placeholder.
 * @param {Object} props - The component props.
 * @param {string} [props.className] - Optional CSS class name for additional styling.
 * @returns {JSX.Element} A full-width skeleton component.
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
