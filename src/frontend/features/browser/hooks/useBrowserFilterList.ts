import { SelectionChangedEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { produce } from "immer";
import { normalizeSync } from "normalize-diacritics";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";

import { GenericContextMenuItem } from "../../global/components/GenericContextMenu";
import { useAppStore } from "../../global/store/AppStore";

import { useBrowserFilterValuesList } from "./useBrowserFilterValuesList";

import { COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX } from "@/const";
import { BrowserFilter } from "@/models/browser";
import { SongMetadataTag, SongMetadataValue } from "@/models/song";
import { BrowserUtils } from "@/utils/BrowserUtils";
import { SongTableUtils } from "@/utils/SongTableUtils";
import { SongUtils } from "@/utils/SongUtils";

export function useBrowserFilterList(metadataTag: SongMetadataTag) {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const browserFilters = useAppStore((state) => state.browserFilters);
  const browserFilterValuesList = useBrowserFilterValuesList();
  const globalFilterTokens = useAppStore((state) => state.globalFilterTokens);
  const updateBrowserFilters = useAppStore(
    (state) => state.updateBrowserFilters,
  );

  const columnName =
    SongTableUtils.convertSongMetadataTagToDisplayName(metadataTag);

  // Ag Grid API
  const gridRef = useRef<AgGridReact>(null);

  // Index of BrowserFilters
  const filterIndex = useMemo(() => {
    if (browserFilters === undefined) {
      return -1;
    }
    return browserFilters.findIndex((v) => v.tag === metadataTag);
  }, [browserFilters, metadataTag]);

  useEffect(() => {
    // Use Ag Grid API to unselect items which were unselected somewhere
    const api = gridRef.current?.api;
    if (!api || browserFilters === undefined || filterIndex < 0) {
      return;
    }

    const trueSelectedValues = browserFilters[filterIndex].selectedValues.map(
      (v) => SongUtils.convertSongMetadataValueToString(v),
    );

    api.getModel().forEachNode((node) => {
      const value = String(node.data[columnName]);
      if (node.isSelected() && !trueSelectedValues.includes(value)) {
        node.setSelected(false);
      } else if (!node.isSelected() && trueSelectedValues.includes(value)) {
        node.setSelected(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterIndex, browserFilters, columnName, gridRef.current]); // React to gridRef.current (undefined => API)

  const rowData = useMemo(() => {
    const values = browserFilterValuesList.get(metadataTag);
    if (values === undefined) {
      return [];
    }
    let targetValues = values;
    if (globalFilterTokens !== undefined) {
      targetValues = values.filter((v) =>
        globalFilterTokens.every((token) =>
          normalizeSync(v).toLowerCase().includes(token),
        ),
      );
    }
    return targetValues.map((v) => {
      return { [columnName]: v };
    });
  }, [browserFilterValuesList, metadataTag, globalFilterTokens, columnName]);

  const columnDefs = useMemo(() => {
    return [
      {
        field: columnName,
        flex: 1,
        resizable: false,
        sortable: false,
        tooltipField: columnName,
      },
    ];
  }, [columnName]);

  const onSelectionChanged = useCallback(
    async (event: SelectionChangedEvent) => {
      if (profile === undefined) {
        return;
      }

      const { api } = event;
      if (browserFilters === undefined) {
        return;
      }

      // Sometimes there is possibly misalignment between AgGrid and Zustand store.
      // If selected values are the same when this callback is fired, just ignore the callback.
      const selectedValuesAgGrid = api
        .getSelectedNodes()
        .map((v) => String(v.data[columnName]));
      const selectedValuesStore = browserFilters[
        filterIndex
      ].selectedValues.map((v) =>
        SongUtils.convertSongMetadataValueToString(v),
      );
      if (selectedValuesAgGrid.length === selectedValuesStore.length) {
        if (
          selectedValuesAgGrid.every((v) => selectedValuesStore.includes(v))
        ) {
          return;
        }
      }

      const selectedMetadataValues = api
        .getSelectedNodes()
        .map((v) => {
          const strValue = v.data[columnName];
          return SongMetadataValue.create({
            value: { $case: "stringValue", stringValue: strValue },
          });
        })
        .filter((v) => v !== undefined) as SongMetadataValue[];

      const newBrowserFilters = BrowserUtils.normalizeBrowserFilters(
        produce(browserFilters, (draft) => {
          draft[filterIndex].selectedValues = selectedMetadataValues;
        }),
      );

      await updateBrowserFilters(newBrowserFilters);
    },
    [profile, browserFilters, filterIndex, updateBrowserFilters, columnName],
  );

  const songMetadataTagsInUse = browserFilters?.map((v) => v.tag) || [];
  const availableSongMetadataTags = BrowserUtils.listBrowserFilterTags().filter(
    (v) => !songMetadataTagsInUse.includes(v),
  );
  const contextMenuId = `${COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX}_${metadataTag}`;
  const contextMenu = useContextMenu({
    id: contextMenuId,
  });
  const contextMenuItems: GenericContextMenuItem<void>[][] = [
    [
      {
        name: "Change to",
        handlers: availableSongMetadataTags.map((v) => [
          SongTableUtils.convertSongMetadataTagFromDisplayName(v),
          async () => {
            if (browserFilters === undefined) {
              return;
            }
            const index = browserFilters.findIndex(
              (filter) => filter.tag === metadataTag,
            );
            if (index < 0) {
              return;
            }
            const newBrowserFilters = produce(browserFilters, (draft) => {
              draft[index].selectedValues = [];
              draft[index].selectedOrder = -1;
              draft[index].tag = v;
            });
            const normalizedNewBrowserFilters =
              BrowserUtils.normalizeBrowserFilters(newBrowserFilters);
            updateBrowserFilters(normalizedNewBrowserFilters);
          },
        ]),
      },
    ],
  ];
  if (availableSongMetadataTags.length > 0) {
    if (contextMenuItems.length > 0) {
      contextMenuItems[0].push({
        name: "Add Panel Below",
        handlers: [
          [
            "Add Below",
            async () => {
              if (browserFilters === undefined) {
                return;
              }
              const index = browserFilters.findIndex(
                (filter) => filter.tag === metadataTag,
              );
              if (index < 0) {
                return;
              }
              const currentOrder = browserFilters[index].order;
              const newBrowserFilters = produce(browserFilters, (draft) => {
                for (const filter of draft) {
                  if (filter.order > currentOrder) {
                    filter.order += 1;
                  }
                }
                draft.push(
                  BrowserFilter.create({
                    tag: availableSongMetadataTags[0],
                    selectedOrder: -1,
                    selectedValues: [],
                    order: currentOrder + 1,
                  }),
                );
              });
              const normalizedNewBrowserFilters =
                BrowserUtils.normalizeBrowserFilters(newBrowserFilters);
              updateBrowserFilters(normalizedNewBrowserFilters);
            },
          ],
        ],
      });
    }
  }
  if (browserFilters !== undefined && browserFilters.length > 1) {
    if (contextMenuItems.length > 0) {
      contextMenuItems[0].push({
        name: "Remove Panel",
        handlers: [
          [
            "Remove Panel",
            async () => {
              if (browserFilters === undefined) {
                return;
              }
              const index = browserFilters.findIndex(
                (filter) => filter.tag === metadataTag,
              );
              if (index < 0) {
                return;
              }
              const newBrowserFilters = produce(browserFilters, (draft) => {
                draft.splice(index, 1);
              });
              const normalizedNewBrowserFilters =
                BrowserUtils.normalizeBrowserFilters(newBrowserFilters);
              updateBrowserFilters(normalizedNewBrowserFilters);
            },
          ],
        ],
      });
    }
  }
  const onContextMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      contextMenu.show({ event: event as TriggerEvent });
    },
    [contextMenu],
  );

  return {
    gridProps: {
      gridRef,
      rowData,
      columnDefs,
      onSelectionChanged,
      onContextMenuOpen,
    },
    contextMenuProps: {
      id: contextMenuId,
      contextMenuItems,
    },
  };
}
