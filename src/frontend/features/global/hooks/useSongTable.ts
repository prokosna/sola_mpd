import {
  CellContextMenuEvent,
  ColumnResizedEvent,
  DisplayedColumnsChangedEvent,
  RowClassParams,
  RowDataUpdatedEvent,
  RowDoubleClickedEvent,
  RowDragEndEvent,
  SelectionChangedEvent,
  SortChangedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";

import { SongTableProps } from "../components/SongTable";
import { useAppStore } from "../store/AppStore";

import { useKeyCombination } from "@/frontend/common_hooks/useKeyCombination";
import { Song } from "@/models/song";
import { FilterUtils } from "@/utils/FilterUtils";
import { SongTableUtils } from "@/utils/SongTableUtils";

export function useSongTable(props: SongTableProps) {
  const globalFilterTokens = useAppStore((state) => state.globalFilterTokens);
  const currentSong = useAppStore((state) => state.currentSong);
  const setIsSongTableLoading = useAppStore(
    (state) => state.setIsSongTableLoading
  );

  const {
    id,
    songs,
    tableColumns,
    isGlobalFilterEnabled,
    isSortingEnabled,
    isReorderingEnabled,
    onSongsReordered,
    onColumnsUpdated,
    onSongsSelected,
    onDoubleClicked,
    getRowClassBySong,
  } = props;

  const songsMap: Map<string, Song> = useMemo(() => {
    return new Map(songs.map((v) => [v.path, v]));
  }, [songs]);

  const contextMenu = useContextMenu({ id });

  // For shortcut keys
  const ref = useRef(null);

  // Ag Grid API
  const gridRef = useRef<AgGridReact>(null);

  // Refresh the table when currentSong is updated
  useEffect(() => {
    if (getRowClassBySong === undefined) {
      return;
    }
    const api = gridRef.current?.api;
    if (api === undefined) {
      return;
    }
    api.redrawRows();
  }, [currentSong, getRowClassBySong]);

  // Ctrl + A to select all songs
  useKeyCombination(ref, ["Control", "a"], async () => {
    const api = gridRef.current?.api;
    if (api === undefined) {
      console.log("api undefined");
      return;
    }
    const songs: Song[] = [];
    api.forEachNodeAfterFilterAndSort((node) => {
      const song = SongTableUtils.convertNodeToSong(songsMap, node);
      if (song === undefined) {
        return;
      }
      songs.push(song);
      node.setSelected(true);
    });
    onSongsSelected(songs);
  });

  const columnDefs = useMemo(() => {
    return tableColumns.map((v, i) => ({
      field: SongTableUtils.convertSongMetadataTagToDisplayName(v.tag),
      rowDrag: i === 0 ? isReorderingEnabled : undefined,
      flex: v.widthFlex,
      resizable: true,
      sortable: isSortingEnabled,
      tooltipField: SongTableUtils.convertSongMetadataTagToDisplayName(v.tag),
      sort:
        !isSortingEnabled ||
        isReorderingEnabled ||
        v.sortOrder === undefined ||
        v.sortOrder < 0
          ? null
          : v.isSortDesc
          ? ("desc" as "desc")
          : ("asc" as "asc"),
      sortIndex:
        !isSortingEnabled || v.sortOrder === undefined || v.sortOrder < 0
          ? null
          : v.sortOrder,
    }));
  }, [tableColumns, isReorderingEnabled, isSortingEnabled]);

  const rowData = useMemo(() => {
    let targetSongs = Array.from(songs);
    if (isGlobalFilterEnabled) {
      targetSongs = FilterUtils.filterSongsByGlobalFilter(
        songs,
        globalFilterTokens,
        tableColumns
      );
    }

    return targetSongs.map((v) => {
      const row: { [tag: string]: string | number | Date | undefined } = {};
      row.path = v.path;
      for (const column of tableColumns) {
        const [tag, value] = SongTableUtils.convertSongMetadataForGridRowValue(
          column.tag,
          v.metadata[column.tag]
        );
        row[tag] = value;
      }
      return row;
    });
  }, [songs, isGlobalFilterEnabled, globalFilterTokens, tableColumns]);

  const getRowClass = useCallback(
    (
      params: RowClassParams<{
        [tag: string]: string | number | Date | undefined;
      }>
    ) => {
      if (getRowClassBySong === undefined || params.data === undefined) {
        return;
      }
      const targetPath = params.data["path"];
      if (targetPath === undefined) {
        return;
      }
      const targetSong = songsMap.get(String(targetPath));
      if (targetSong === undefined) {
        return;
      }
      return getRowClassBySong(targetSong);
    },
    [getRowClassBySong, songsMap]
  );

  // Event handlers
  const onContextMenuOpen = useCallback(
    (event: CellContextMenuEvent) => {
      const { columnApi, api, data } = event;
      const targetPath: string | undefined = data?.path;
      if (targetPath == null) {
        return;
      }
      if (!event.event) {
        return;
      }

      const columns = columnApi.getAllGridColumns();
      const currentColumns =
        SongTableUtils.convertAgGridColumnsToSongTableColumns(columns);
      if (!isSortingEnabled) {
        for (const column of currentColumns) {
          const index = tableColumns.findIndex((v) => v.tag === column.tag);
          if (index >= 0) {
            column.sortOrder = tableColumns[index].sortOrder;
            column.isSortDesc = tableColumns[index].isSortDesc;
          }
        }
      }

      let { targetSong, selectedSongsSorted } = SongTableUtils.getSongsFromGrid(
        songsMap,
        api,
        targetPath
      );

      // If selectedSongs is only 1 and it is not the target path, then ignore it
      if (
        selectedSongsSorted.length === 1 &&
        selectedSongsSorted[0].path !== targetPath
      ) {
        selectedSongsSorted = [];
      }

      contextMenu.show({
        event: event.event as TriggerEvent,
        props: {
          columns: currentColumns,
          song: targetSong,
          selectedSongs: selectedSongsSorted,
        },
      });
    },
    [isSortingEnabled, songsMap, contextMenu, tableColumns]
  );

  const onSortChanged = useCallback(
    (event: SortChangedEvent) => {
      const { columnApi } = event;
      const columns = columnApi.getAllGridColumns();
      const currentColumns =
        SongTableUtils.convertAgGridColumnsToSongTableColumns(columns);
      if (!isSortingEnabled) {
        for (const column of currentColumns) {
          const index = tableColumns.findIndex((v) => v.tag === column.tag);
          if (index >= 0) {
            column.sortOrder = tableColumns[index].sortOrder;
            column.isSortDesc = tableColumns[index].isSortDesc;
          }
        }
      }
      onColumnsUpdated(currentColumns);
    },
    [isSortingEnabled, onColumnsUpdated, tableColumns]
  );

  const onColumnsMoved = useCallback(
    (event: DisplayedColumnsChangedEvent) => {
      const { columnApi } = event;
      const columns = columnApi.getAllGridColumns();
      const currentColumns =
        SongTableUtils.convertAgGridColumnsToSongTableColumns(columns);
      if (!isSortingEnabled) {
        for (const column of currentColumns) {
          const index = tableColumns.findIndex((v) => v.tag === column.tag);
          if (index >= 0) {
            column.sortOrder = tableColumns[index].sortOrder;
            column.isSortDesc = tableColumns[index].isSortDesc;
          }
        }
      }
      onColumnsUpdated(currentColumns);
    },
    [isSortingEnabled, onColumnsUpdated, tableColumns]
  );

  const onColumnsResized = useCallback(
    (event: ColumnResizedEvent) => {
      if (!event.finished) {
        return;
      }
      const { columnApi } = event;
      const columns = columnApi.getAllGridColumns();
      const currentColumns =
        SongTableUtils.convertAgGridColumnsToSongTableColumns(columns);
      if (!isSortingEnabled) {
        for (const column of currentColumns) {
          const index = tableColumns.findIndex((v) => v.tag === column.tag);
          if (index >= 0) {
            column.sortOrder = tableColumns[index].sortOrder;
            column.isSortDesc = tableColumns[index].isSortDesc;
          }
        }
      }
      onColumnsUpdated(currentColumns);
    },
    [isSortingEnabled, onColumnsUpdated, tableColumns]
  );

  const onRowDragEnd = useCallback(
    (event: RowDragEndEvent) => {
      const { api } = event;
      const { songsSorted } = SongTableUtils.getSongsFromGrid(songsMap, api);
      onSongsReordered(songsSorted);
    },
    [songsMap, onSongsReordered]
  );

  const onRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent) => {
      const { api, data } = event;
      const targetPath: string | undefined = data.path;
      if (targetPath == null) {
        return;
      }
      if (!event.event) {
        return;
      }

      const { targetSong, songsSorted } = SongTableUtils.getSongsFromGrid(
        songsMap,
        api,
        targetPath
      );
      if (targetSong === undefined) {
        return;
      }
      onDoubleClicked(targetSong, songsSorted);
    },
    [songsMap, onDoubleClicked]
  );

  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;
      const { selectedSongsSorted } = SongTableUtils.getSongsFromGrid(
        songsMap,
        api
      );
      onSongsSelected(selectedSongsSorted);
    },
    [songsMap, onSongsSelected]
  );

  const onRowDataUpdated = useCallback(
    (_: RowDataUpdatedEvent) => {
      setIsSongTableLoading(false);
    },
    [setIsSongTableLoading]
  );

  return {
    ref,
    gridRef,
    rowData,
    columnDefs,
    onContextMenuOpen,
    onSortChanged,
    onColumnsMoved,
    onColumnsResized,
    onRowDragEnd,
    onRowDoubleClicked,
    onSelectionChanged,
    onRowDataUpdated,
    getRowClass,
  };
}
