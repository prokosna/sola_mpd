"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  Center,
  Flex,
  IconButton,
  Tag,
  TagCloseButton,
  TagLabel,
  Tooltip,
} from "@chakra-ui/react";
import React from "react";
import { IoChevronForward, IoClose } from "react-icons/io5";

import { useBrowserFilterBreadcrumbs } from "../hooks/useBrowserFilterBreadcrumbs";

import { SongUtils } from "@/utils/SongUtils";

export default function BrowserFilterBreadcrumbs() {
  const { filterBreadcrumbsGroup, onCloseClicked, onResetClicked } =
    useBrowserFilterBreadcrumbs();

  if (filterBreadcrumbsGroup.length === 0) {
    return null;
  }

  return (
    <>
      <Flex
        borderTop={"1px solid"}
        borderTopColor={"gray.300"}
        borderLeft={"1px solid"}
        borderLeftColor={"gray.300"}
      >
        <Center w="25px" px="1px">
          <IconButton
            variant="ghost"
            colorScheme="gray"
            aria-label="Reset filters"
            size="xs"
            onClick={onResetClicked}
            icon={<IoClose />}
          />
        </Center>
        <Center px={5} py={1} w={"calc(100% - 27px)"} overflow={"auto"}>
          <Breadcrumb spacing="8px" separator={<IoChevronForward />}>
            {filterBreadcrumbsGroup.map((group, i) => (
              <BreadcrumbItem key={`bcg_${i}`}>
                {group.map((v) => (
                  <Tooltip
                    key={SongUtils.convertSongMetadataValueToString(
                      v.metadataValue,
                    )}
                    hasArrow
                    label={SongUtils.convertSongMetadataValueToString(
                      v.metadataValue,
                    )}
                  >
                    <Tag
                      key={SongUtils.convertSongMetadataValueToString(
                        v.metadataValue,
                      )}
                      size={"sm"}
                      borderRadius="full"
                      variant="outline"
                      color="brand.900"
                      maxWidth="200px"
                      minWidth="50px"
                    >
                      <TagLabel>
                        {SongUtils.convertSongMetadataValueToString(
                          v.metadataValue,
                        )}
                      </TagLabel>
                      {v.isPlaceholder ? null : (
                        <TagCloseButton
                          onClick={() =>
                            onCloseClicked(v.metadataTag!, v.metadataValue)
                          }
                        ></TagCloseButton>
                      )}
                    </Tag>
                  </Tooltip>
                ))}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        </Center>
      </Flex>
    </>
  );
}
