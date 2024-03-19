"use client";
import { Box, VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";
import React from "react";

import { useAppStore } from "../../global/store/AppStore";

import BrowserFilterList from "./BrowserFilterList";

import FullWidthSkeleton from "@/frontend/common_ui/elements/FullWidthSkeleton";

export default function BrowserFiltersPane() {
  const browserFilters = useAppStore((state) => state.browserFilters);
  const { colorMode } = useColorMode();

  if (browserFilters === undefined) {
    return <FullWidthSkeleton></FullWidthSkeleton>;
  }

  const tags = Array.from(browserFilters)
    .sort((a, b) => a.order - b.order)
    .map((v) => v.tag);

  return (
    <>
      <VStack h="full" spacing={0}>
        <Allotment
          className={
            colorMode === "light" ? "allotment-light" : "allotment-dark"
          }
          vertical={true}
        >
          {tags.map((tag, index) => (
            <Allotment.Pane key={index} minSize={20}>
              <Box key={index} w="100%" h="full">
                <BrowserFilterList key={tag} tag={tag}></BrowserFilterList>
              </Box>
            </Allotment.Pane>
          ))}
        </Allotment>
      </VStack>
    </>
  );
}
