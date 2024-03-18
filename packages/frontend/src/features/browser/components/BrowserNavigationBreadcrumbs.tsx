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
import { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { useCallback, useMemo } from "react";
import { IoChevronForward, IoClose } from "react-icons/io5";

import { resetAllFilters, selectFilterValues } from "../helpers/filter";
import {
  useBrowserFiltersState,
  useSetBrowserFiltersState,
} from "../states/filters";

export function BrowserNavigationBreadcrumbs() {
  const browserFilters = useBrowserFiltersState();
  const setBrowserFilters = useSetBrowserFiltersState();
  const selectedBrowserFilters = useMemo(
    () =>
      browserFilters
        ?.filter((filter) => filter.selectedValues.length > 0)
        .toSorted((a, b) => a.selectedOrder - b.selectedOrder),
    [browserFilters],
  );

  const onClickReset = useCallback(() => {
    if (browserFilters === undefined) {
      return;
    }
    const newFilters = resetAllFilters(browserFilters);
    setBrowserFilters(newFilters);
  }, [browserFilters, setBrowserFilters]);

  const onClickClose = useCallback(
    (browserFilter: BrowserFilter, value: string) => {
      if (browserFilters === undefined) {
        return;
      }
      const selectedValues = browserFilter.selectedValues.map((selectedValue) =>
        SongUtils.convertSongMetadataValueToString(selectedValue),
      );
      const index = selectedValues.findIndex(
        (selectedValue) => selectedValue === value,
      );
      if (index < 0) {
        return;
      }
      selectedValues.splice(index, 1);
      const newFilters = selectFilterValues(
        browserFilters,
        browserFilter,
        selectedValues,
      );
      setBrowserFilters(newFilters);
    },
    [browserFilters, setBrowserFilters],
  );

  if (
    selectedBrowserFilters === undefined ||
    selectedBrowserFilters.length === 0
  ) {
    return null;
  }

  return (
    <>
      <Flex className="layout-border-top layout-border-left">
        <Center w="25px" px="1px">
          <IconButton
            variant="ghost"
            colorScheme="gray"
            aria-label="Reset filters"
            size="xs"
            onClick={onClickReset}
            icon={<IoClose />}
          />
        </Center>
        <Center px={5} py={1} w={"calc(100% - 27px)"} overflow={"auto"}>
          <Breadcrumb spacing="8px" separator={<IoChevronForward />}>
            {selectedBrowserFilters.map((browserFilter) => (
              <BreadcrumbItem key={`breadcrumb_item_${browserFilter.tag}`}>
                {browserFilter.selectedValues.map((value) => (
                  <Tooltip
                    key={SongUtils.convertSongMetadataValueToString(value)}
                    hasArrow
                    label={SongUtils.convertSongMetadataValueToString(value)}
                  >
                    <Tag
                      key={SongUtils.convertSongMetadataValueToString(value)}
                      className="browser-breadcrumbs-tag"
                      size={"sm"}
                      borderRadius="full"
                      variant="outline"
                      maxWidth="200px"
                      minWidth="50px"
                    >
                      <TagLabel className="browser-breadcrumbs-tag-label">
                        {SongUtils.convertSongMetadataValueToString(value)}
                      </TagLabel>
                      <TagCloseButton
                        onClick={() =>
                          onClickClose(
                            browserFilter,
                            SongUtils.convertSongMetadataValueToString(value),
                          )
                        }
                      ></TagCloseButton>
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
