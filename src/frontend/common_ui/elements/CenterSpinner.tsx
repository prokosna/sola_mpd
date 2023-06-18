"use client";
import { Center, Spinner } from "@chakra-ui/react";
import React from "react";

export function CenterSpinner() {
  return (
    <>
      <Center w="100%" h="100%">
        <Spinner boxSize="24" thickness="6px" color="brand.500"></Spinner>
      </Center>
    </>
  );
}
