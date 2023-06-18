"use client";
import { Box, SkeletonText } from "@chakra-ui/react";
import React from "react";

export default function FullWidthSkeleton() {
  return (
    <>
      <Box p="6">
        <SkeletonText mt="4" noOfLines={6} spacing="4" skeletonHeight="2" />
      </Box>
    </>
  );
}
