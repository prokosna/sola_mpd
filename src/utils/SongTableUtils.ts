import { Column, GridApi, IRowNode } from "ag-grid-community";
import dayjs from "dayjs";
import equal from "fast-deep-equal";
import { produce } from "immer";

import { SongUtils } from "./SongUtils";

import { Song, SongMetadataTag, SongMetadataValue } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";

/**
 * What value is used for the row key in a song table
 */
export enum SongTableKeyType {
  PATH = "PATH",
  INDEX_PATH = "INDEX_PATH",
  ID = "ID",
}

export type SongTableRowDataType = {
  [tag: string]: string | number | Date | undefined;
};

/**
 * Utility type to get songs in a table with its index (position)
 */
export type SongsInTable = {
  targetSong: Song | undefined;
  songsSorted: Song[];
  selectedSongsSorted: Song[];
};

export class SongTableUtils {
  static getSongTableKey(keyType: SongTableKeyType, song: Song): string {
    switch (keyType) {
      case SongTableKeyType.ID:
        const id = SongUtils.getSongMetadataAsString(song, SongMetadataTag.ID);
        if (id === "") {
          console.warn(
            `ID is specified as a song table key, but empty: ${song}`
          );
        }
        return id;
      case SongTableKeyType.PATH:
        return song.path;
      case SongTableKeyType.INDEX_PATH:
        return `${song.index}_${song.path}`;
      default:
        throw Error(`Unsupported song table key: ${keyType}`);
    }
  }

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
    newOrder: Song[],
    keyType: SongTableKeyType
  ): {
    id: string;
    to: number;
  }[] {
    const ops: { id: string; to: number }[] = [];
    newOrder.forEach((song, index) => {
      const prevSong = prevOrder[index];
      const prevSongKey = this.getSongTableKey(keyType, prevSong);
      const songKey = this.getSongTableKey(keyType, song);
      if (prevSongKey !== songKey) {
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
    targetKey?: string
  ): SongsInTable {
    const nodes: IRowNode[] = [];
    let targetNode: IRowNode | undefined = undefined;
    gridApi.forEachNodeAfterFilterAndSort((node) => {
      nodes.push(node);
      if (targetKey !== undefined && node.data?.key === targetKey) {
        targetNode = node;
      }
    });

    const targetSong =
      targetNode !== undefined
        ? this.convertNodeToSong(songsMap, targetNode)
        : undefined;
    const songsSorted: Song[] = [];
    const selectedSongsSorted: Song[] = [];
    nodes.forEach((node) => {
      const song = this.convertNodeToSong(songsMap, node);
      if (song !== undefined) {
        songsSorted.push(song);
        if (node.isSelected()) {
          selectedSongsSorted.push(song);
        }
      }
    });

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
    selectedSongs: Song[],
    keyType: SongTableKeyType
  ): Song[] | undefined {
    const targetSongs = [];
    if (
      song !== undefined &&
      !selectedSongs
        .map((v) => this.getSongTableKey(keyType, v))
        .includes(this.getSongTableKey(keyType, song))
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

  static convertNodeToSong(
    songsMap: Map<string, Song>,
    node: IRowNode
  ): Song | undefined {
    const key = node.data?.key;
    if (key == null) {
      return undefined;
    }
    const song = songsMap.get(key);
    if (song === undefined) {
      throw new Error(`No song found: ${key}`);
    }
    return song;
  }
}
