import { Column, GridApi, IRowNode } from "ag-grid-community";
import dayjs from "dayjs";
import equal from "fast-deep-equal";
import { produce } from "immer";

import { SongUtils } from "./SongUtils";

import { Song, SongMetadataTag, SongMetadataValue } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";

export type SongsInTable = {
  targetSong: Song | undefined;
  songsSorted: Song[];
  selectedSongsSorted: Song[];
};

export class SongTableUtils {
  static getSongTableColumnsWithoutSorting(
    columns: SongTableColumn[]
  ): SongTableColumn[] {
    return columns.map((v) => {
      return produce(v, (draft) => {
        draft.sortOrder = undefined;
        draft.isSortDesc = false;
      });
    });
  }

  static convertSongMetadataTagToDisplayName(tag: SongMetadataTag): string {
    return tag
      .split("_")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  static convertSongMetadataTagFromDisplayName(str: string): SongMetadataTag {
    const tag = str
      .split(" ")
      .map((v) => v.toUpperCase())
      .join("_");
    return SongMetadataTag[tag as keyof typeof SongMetadataTag];
  }

  static convertOrderingToOperations(
    prevOrder: Song[],
    newOrder: Song[]
  ): {
    id: string;
    to: number;
  }[] {
    const ops: { id: string; to: number }[] = [];
    newOrder.forEach((song, index) => {
      const prevSong = prevOrder[index];
      if (prevSong.path !== song.path) {
        ops.push({
          id: SongUtils.getSongMetadataAsString(song, SongMetadataTag.ID),
          to: index,
        });
      }
    });
    return ops;
  }

  static convertAgGridColumnsToSongTableColumns(
    agGridColumns: Column[]
  ): SongTableColumn[] {
    return agGridColumns.map((col) => {
      const sortOrder = col.getSortIndex();
      const isSortDesc = (() => {
        switch (col.getSort()) {
          case "asc":
            return false;
          case "desc":
            return true;
          default:
            return false;
        }
      })();
      const flex = col.getActualWidth();
      const column = SongTableColumn.create({
        tag: this.convertSongMetadataTagFromDisplayName(col.getColId()),
        sortOrder: sortOrder != null ? sortOrder : undefined,
        isSortDesc,
        widthFlex: flex,
      });
      return column;
    });
  }

  static getSongsFromGrid(
    songsMap: Map<string, Song>,
    gridApi: GridApi,
    targetPath?: string
  ): SongsInTable {
    const nodes: IRowNode[] = [];
    let targetNode: IRowNode | undefined = undefined;
    gridApi.forEachNodeAfterFilterAndSort((node) => {
      nodes.push(node);
      if (targetPath !== undefined && node.data?.path === targetPath) {
        targetNode = node;
      }
    });

    const selectedIndices = nodes
      .map((v, index) => (v.isSelected() ? index : undefined))
      .filter((v) => v !== undefined) as number[];
    const targetSong =
      targetNode !== undefined
        ? this.convertNodeToSong(songsMap, targetNode)
        : undefined;
    const songsSorted = nodes
      .map((v) => this.convertNodeToSong(songsMap, v))
      .filter((v) => v !== undefined) as Song[];
    const selectedSongsSorted = selectedIndices.map(
      (index) => songsSorted[index]
    );

    return {
      targetSong,
      songsSorted,
      selectedSongsSorted,
    };
  }

  static convertSongMetadataForGridRowValue(
    tag: SongMetadataTag,
    value: SongMetadataValue
  ): [string, string | number | Date | undefined] {
    const v = (() => {
      switch (value.value?.$case) {
        case "stringValue":
          return value.value.stringValue;
        case "floatValue":
          return value.value.floatValue;
        case "intValue":
          return value.value.intValue;
        case "timestamp":
          return dayjs(value.value.timestamp).format("YYYY-MM-DD");
        case "format":
          return SongUtils.convertAudioFormatToString(value.value.format);
      }
    })();
    return [this.convertSongMetadataTagToDisplayName(tag), v];
  }

  static normalizeMetadataColumns(
    columns: SongTableColumn[]
  ): SongTableColumn[] {
    return produce(columns, (draft) => {
      const sorted = Array.from(
        columns.filter((v) => v.sortOrder !== undefined && v.sortOrder >= 0)
      ).sort((a, b) => a.sortOrder! - b.sortOrder!);
      for (const column of draft) {
        if (column.sortOrder !== undefined && column.sortOrder >= 0) {
          column.sortOrder = sorted.findIndex((v) => equal(v, column));
        }
      }
    });
  }

  static getTrueTargetSongs(
    song: Song | undefined,
    selectedSongs: Song[]
  ): Song[] | undefined {
    const targetSongs = [];
    if (
      song !== undefined &&
      !selectedSongs.map((v) => v.path).includes(song.path)
    ) {
      targetSongs.push(song);
    } else {
      targetSongs.push(...selectedSongs);
    }
    if (targetSongs.length === 0) {
      return;
    }
    return targetSongs;
  }

  private static convertNodeToSong(
    songsMap: Map<string, Song>,
    node: IRowNode
  ): Song | undefined {
    const path = node.data?.path;
    if (path == null) {
      return undefined;
    }
    const song = songsMap.get(path);
    if (song === undefined) {
      throw new Error(`No song found: ${path}`);
    }
    return song;
  }
}
