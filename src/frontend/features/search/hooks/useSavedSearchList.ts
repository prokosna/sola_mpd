import { useToast } from "@chakra-ui/react";
import { CellContextMenuEvent, SelectionChangedEvent } from "ag-grid-community";
import { produce } from "immer";
import { useCallback, useEffect, useMemo } from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";

import { GenericContextMenuItem } from "../../global/components/GenericContextMenu";
import { useAppStore } from "../../global/store/AppStore";

import { COMPONENT_ID_SEARCH_SIDE_PANE } from "@/const";
import { Search } from "@/models/search";

export type SavedSearchSelectContextMenuItem = {
  name: string;
  onClick: (targetSearch: Search) => Promise<void>;
};

export function useSavedSearchList() {
  const savedSearches = useAppStore((state) => state.savedSearches);
  const pullSavedSearches = useAppStore((state) => state.pullSavedSearches);
  const updateEditingSearch = useAppStore((state) => state.updateEditingSearch);
  const updateSavedSearches = useAppStore((state) => state.updateSavedSearches);
  const toast = useToast();

  // Initial loading
  useEffect(() => {
    pullSavedSearches();
  }, [pullSavedSearches]);

  // Grid props
  const columnDefs = useMemo(() => {
    return [
      {
        field: "SavedSearch",
        flex: 1,
        resizable: false,
        sortable: false,
        tooltipField: "Metadata",
      },
    ];
  }, []);

  const rowData = useMemo(() => {
    if (savedSearches === undefined) {
      return [];
    }
    return Array.from(savedSearches)
      ?.sort((a, b) => (a.name > b.name ? 1 : -1))
      .map((v) => ({
        ["SavedSearch"]: v.name,
        ["Metadata"]: `${v.name}`,
      }));
  }, [savedSearches]);

  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;
      if (savedSearches === undefined) {
        return;
      }

      const node = api.getSelectedNodes()[0];
      if (node === undefined) {
        return;
      }

      const index = savedSearches.findIndex(
        (v) => v.name === node.data["SavedSearch"],
      );
      if (index < 0) {
        return;
      }

      updateEditingSearch(savedSearches[index], true);
    },
    [savedSearches, updateEditingSearch],
  );

  const contextMenu = useContextMenu({ id: COMPONENT_ID_SEARCH_SIDE_PANE });
  const contextMenuItems: GenericContextMenuItem<Search>[][] = [
    [
      {
        name: "Delete",
        handlers: [
          [
            "Delete",
            async (selected: Search | undefined) => {
              if (savedSearches === undefined) {
                return;
              }

              const index = savedSearches.findIndex(
                (v) => v.name === selected?.name,
              );
              if (index < 0) {
                return;
              }

              const newSavedSearches = produce(savedSearches, (draft) => {
                draft.splice(index, 1);
              });
              updateSavedSearches(newSavedSearches);
              toast({
                status: "success",
                title: "Saved search deleted",
                description: `Saved search "${selected?.name}" was deleted.`,
              });
            },
          ],
        ],
      },
    ],
  ];
  const onContextMenuOpen = useCallback(
    (event: CellContextMenuEvent) => {
      const { data } = event;
      const targetName: string | undefined = data["SavedSearch"];
      if (!event.event) {
        return;
      }

      const targetSearch = savedSearches?.filter(
        (v) => v.name === targetName,
      )[0];
      if (targetSearch === undefined) {
        return;
      }

      contextMenu.show({
        event: event.event as TriggerEvent,
        props: targetSearch,
      });
    },
    [contextMenu, savedSearches],
  );

  return {
    gridProps: {
      rowData,
      columnDefs,
      onSelectionChanged,
      onContextMenuOpen,
    },
    contextMenuProps: {
      id: COMPONENT_ID_SEARCH_SIDE_PANE,
      contextMenuItems,
    },
  };
}
