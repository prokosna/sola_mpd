import {
  CellContextMenuEvent,
  ColumnResizedEvent,
  DisplayedColumnsChangedEvent,
  GetRowIdParams,
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
import { SongTableRowDataType, SongTableUtils } from "@/utils/SongTableUtils";

export function useSongTable(props: SongTableProps) {
  const {
    id,
    songTableKeyType,
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

  const globalFilterTokens = useAppStore((state) => state.globalFilterTokens);
  const currentSong = useAppStore((state) => state.currentSong);
  const setIsSongTableLoading = useAppStore(
    (state) => state.setIsSongTableLoading
  );

  const targetSongs: Song[] = useMemo(() => {
    let targetSongs = Array.from(songs);
    if (isGlobalFilterEnabled) {
      targetSongs = FilterUtils.filterSongsByGlobalFilter(
        songs,
        globalFilterTokens,
        tableColumns
      );
    }
    targetSongs = targetSongs.map((song, index) => {
      song.index = index;
      return song;
    });
    return targetSongs;
  }, [globalFilterTokens, isGlobalFilterEnabled, songs, tableColumns]);

  const targetSongsMap: Map<string, Song> = useMemo(() => {
    return new Map(
      targetSongs.map((v) => [
        SongTableUtils.getSongTableKey(songTableKeyType, v),
        v,
      ])
    );
  }, [songTableKeyType, targetSongs]);

  const contextMenu = useContextMenu({ id });

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

  // For shortcut keys
  const ref = useRef(null);

  // Ctrl + A to select all songs
  useKeyCombination(ref, ["Control", "a"], async () => {
    const api = gridRef.current?.api;
    if (api === undefined) {
      console.warn("api undefined");
      return;
    }
    const selectedSongs: Song[] = [];
    api.forEachNodeAfterFilterAndSort((node) => {
      const song = SongTableUtils.convertNodeToSong(targetSongsMap, node);
      if (song === undefined) {
        return;
      }
      selectedSongs.push(song);
      node.setSelected(true);
    });
    onSongsSelected(selectedSongs);
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
    return targetSongs.map((v) => {
      const row: SongTableRowDataType = {};
      row.key = SongTableUtils.getSongTableKey(songTableKeyType, v);
      for (const column of tableColumns) {
        const [tag, value] = SongTableUtils.convertSongMetadataForGridRowValue(
          column.tag,
          v.metadata[column.tag]
        );
        row[tag] = value;
      }
      return row;
    });
  }, [targetSongs, songTableKeyType, tableColumns]);

  const getRowId = useCallback(
    (params: GetRowIdParams<SongTableRowDataType>) => {
      return String(params.data.key);
    },
    []
  );

  const getRowClass = useCallback(
    (params: RowClassParams<SongTableRowDataType>) => {
      if (getRowClassBySong === undefined || params.data === undefined) {
        return;
      }
      const targetKey = params.data.key;
      if (targetKey === undefined) {
        return;
      }
      const targetSong = targetSongsMap.get(String(targetKey));
      if (targetSong === undefined) {
        return;
      }
      return getRowClassBySong(targetSong);
    },
    [getRowClassBySong, targetSongsMap]
  );

  // Event handlers
  const onContextMenuOpen = useCallback(
    (event: CellContextMenuEvent) => {
      const { columnApi, api, data } = event;
      const targetKey: string | undefined = data?.key;
      if (targetKey == null) {
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

      let { targetSong, songsSorted, selectedSongsSorted } =
        SongTableUtils.getSongsFromGrid(targetSongsMap, api, targetKey);

      // If selectedSongs is only 1 and it is not the target song, then ignore it
      if (selectedSongsSorted.length === 1 && targetSong !== undefined) {
        const firstKey = SongTableUtils.getSongTableKey(
          songTableKeyType,
          selectedSongsSorted[0]
        );
        const targetKey = SongTableUtils.getSongTableKey(
          songTableKeyType,
          targetSong
        );
        if (firstKey !== targetKey) {
          selectedSongsSorted = [];
        }
      }

      contextMenu.show({
        event: event.event as TriggerEvent,
        props: {
          columns: currentColumns,
          song: targetSong,
          songs: songsSorted,
          selectedSongs: selectedSongsSorted,
        },
      });
    },
    [
      isSortingEnabled,
      targetSongsMap,
      contextMenu,
      tableColumns,
      songTableKeyType,
    ]
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
      const { songsSorted } = SongTableUtils.getSongsFromGrid(
        targetSongsMap,
        api
      );
      onSongsReordered(songsSorted);
    },
    [targetSongsMap, onSongsReordered]
  );

  const onRowDoubleClicked = useCallback(
    (event: RowDoubleClickedEvent) => {
      const { api, data } = event;
      const targetKey: string | undefined = data.key;
      if (targetKey == null) {
        return;
      }
      if (!event.event) {
        return;
      }

      const { targetSong, songsSorted } = SongTableUtils.getSongsFromGrid(
        targetSongsMap,
        api,
        targetKey
      );
      if (targetSong === undefined) {
        return;
      }
      onDoubleClicked(targetSong, songsSorted);
    },
    [targetSongsMap, onDoubleClicked]
  );

  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const { api } = event;
      const { selectedSongsSorted } = SongTableUtils.getSongsFromGrid(
        targetSongsMap,
        api
      );
      onSongsSelected(selectedSongsSorted);
    },
    [targetSongsMap, onSongsSelected]
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
    getRowId,
    getRowClass,
  };
}
