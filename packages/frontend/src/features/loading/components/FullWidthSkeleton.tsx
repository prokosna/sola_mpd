import { Box, SkeletonText } from "@chakra-ui/react";

export function FullWidthSkeleton({ className }: { className?: string }) {
  return (
    <>
      <Box w="100%" h="100%" p="6" className={className}>
        <SkeletonText mt="4" noOfLines={6} spacing="4" skeletonHeight="2" />
      </Box>
    </>
  );
}
