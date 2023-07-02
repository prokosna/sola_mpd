"use client";
import { Box, VStack } from "@chakra-ui/react";
import { Allotment } from "allotment";
import React from "react";

import { useBrowserResizablePane } from "../hooks/useBrowserResizablePane";

import BrowserFilterBreadcrumbs from "./BrowserFilterBreadcrumbs";
import BrowserFiltersPane from "./BrowserFiltersPane";
import BrowserMainPane from "./BrowserMainPane";

import { CenterSpinner } from "@/frontend/common_ui/elements/CenterSpinner";

export default function Browser() {
  const { isLoading, leftPaneWidthStr, rightPaneWidthStr, onPaneWidthChanged } =
    useBrowserResizablePane();

  if (
    isLoading ||
    leftPaneWidthStr === undefined ||
    rightPaneWidthStr === undefined
  ) {
    return <CenterSpinner></CenterSpinner>;
  }

  return (
    <>
      <VStack h="full" spacing={0}>
        <Box w="100%" backgroundColor="brand.50">
          <BrowserFilterBreadcrumbs></BrowserFilterBreadcrumbs>
        </Box>
        <Box w="100%" h="full">
          <Allotment
            onChange={(sizes) => {
              onPaneWidthChanged(sizes[0], sizes[1]);
            }}
          >
            <Allotment.Pane preferredSize={leftPaneWidthStr} minSize={200}>
              <BrowserFiltersPane></BrowserFiltersPane>
            </Allotment.Pane>
            <Allotment.Pane preferredSize={rightPaneWidthStr}>
              <BrowserMainPane></BrowserMainPane>
            </Allotment.Pane>
          </Allotment>
        </Box>
      </VStack>
    </>
  );
}
