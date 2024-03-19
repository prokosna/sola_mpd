"use client";
import { Box } from "@chakra-ui/react";
import React from "react";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Box w="100%" h="100vh">
        {children}
      </Box>
    </>
  );
}
