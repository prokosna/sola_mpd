import {
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import {
  SongTableColumn,
  SongTableState,
} from "@sola_mpd/domain/src/models/song_table_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { GridApi, IRowNode } from "ag-grid-community";
import dayjs from "dayjs";

import {
  SongTableContextMenuItemParams,
  SongTableKeyType,
  SongTableRowCompact,
  SongsInTable,
} from "../types/songTableTypes";

import { copySortingAttributesToNewColumns } from "./columnUtils";

/**
 * Convert a given node to Song using its key and SongsMap.
 * @param songsMap SongKey -> Song mapping.
 * @param node Node of a table in question.
 * @returns Song represented by a given node.
 */
export function convertNodeToSong(
  songsMap: Map<string, Song>,
  node: IRowNode,
): Song {
  const key = node.data?.key;
  if (key == null) {
    throw new Error(
      `Key is not defined for ${node}. This should be an implementation error.`,
    );
  }
  const song = songsMap.get(key);
  if (song === undefined) {
    throw new Error(`No song found for key=${key}.`);
  }
  return song;
}

/**
 * Gets SongTableKey of a given song.
 * @param song Song.
 * @param keyType SongTableKeyType.
 * @returns SongTableKey.
 */
export function getSongTableKey(song: Song, keyType: SongTableKeyType): string {
  switch (keyType) {
    case SongTableKeyType.ID: {
      const id = SongUtils.getSongMetadataAsString(song, Song_MetadataTag.ID);
      if (id === "") {
        console.warn(
          `ID is specified as a song table key, but ID is empty: ${song}`,
        );
      }
      return id;
    }
    case SongTableKeyType.PATH: {
      return song.path;
    }
    case SongTableKeyType.INDEX_PATH: {
      return `${song.index}_${song.path}`;
    }
    default:
      throw Error(`Unsupported song table key: ${keyType}.`);
  }
}

export function getTargetSongsForContextMenu(
  params: SongTableContextMenuItemParams,
  keyType: SongTableKeyType,
): Song[] {
  const { clickedSong, selectedSortedSongs } = params;

  const targetSongs = [];
  if (
    params.clickedSong !== undefined &&
    !selectedSortedSongs
      .map((song) => getSongTableKey(song, keyType))
      .includes(getSongTableKey(clickedSong, keyType))
  ) {
    targetSongs.push(clickedSong);
  } else {
    targetSongs.push(...selectedSortedSongs);
  }
  return targetSongs;
}

export function convertSongMetadataTagToDisplayName(
  tag: Song_MetadataTag,
): string {
  return Song_MetadataTag[tag]
    .split("_")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function convertSongMetadataTagFromDisplayName(
  str: string,
): Song_MetadataTag {
  const tag = str
    .split(" ")
    .map((v) => v.toUpperCase())
    .join("_");
  return Song_MetadataTag[tag as keyof typeof Song_MetadataTag];
}

export function convertOrderingToOperations(
  currentSongs: Song[],
  orderedSongs: Song[],
  keyType: SongTableKeyType,
): {
  id: string;
  to: number;
}[] {
  const ops: { id: string; to: number }[] = [];
  orderedSongs.forEach((orderedSong, index) => {
    const currentSong = currentSongs[index];
    const currentSongKey = getSongTableKey(currentSong, keyType);
    const orderedSongKey = getSongTableKey(orderedSong, keyType);
    if (currentSongKey !== orderedSongKey) {
      ops.push({
        id: SongUtils.getSongMetadataAsString(orderedSong, Song_MetadataTag.ID),
        to: index,
      });
    }
  });
  return ops;
}

export function convertSongMetadataForGridRowValue(
  tag: Song_MetadataTag,
  value: Song_MetadataValue,
): [string, string | number | Date | undefined] {
  const v = (() => {
    switch (value.value.case) {
      case "stringValue":
        return value.value.value.value;
      case "floatValue":
        return value.value.value.value;
      case "intValue":
        return value.value.value.value;
      case "timestamp":
        return dayjs(value.value.value.toDate()).format("YYYY-MM-DD");
      case "format":
        return SongUtils.convertAudioFormatToString(value.value.value);
    }
  })();
  return [convertSongMetadataTagToDisplayName(tag), v];
}

export function convertSongForGridRowValueCompact(
  song: Song,
): SongTableRowCompact {
  const title = SongUtils.getSongMetadataAsString(song, Song_MetadataTag.TITLE);
  const artist = SongUtils.getSongMetadataAsString(
    song,
    Song_MetadataTag.ARTIST,
  );
  const albumArtist = SongUtils.getSongMetadataAsString(
    song,
    Song_MetadataTag.ALBUM_ARTIST,
  );
  const album = SongUtils.getSongMetadataAsString(song, Song_MetadataTag.ALBUM);

  return {
    firstLine: title,
    secondLine: `${album} / ${artist ?? albumArtist ?? "-"}`,
  };
}

/**
 * Gets SongsInTable representing a clicked song, sorted songs and selected songs.
 * @param clickedSongKey Key field of a song which is clicked if exists.
 * @param gridApi GridAPI of a table in question.
 * @param songsMap SongTableKey -> Song mapping.
 * @returns SongsInTable.
 */
export function getSongsInTableFromGrid(
  clickedSongKey: string | undefined,
  gridApi: GridApi,
  songsMap: Map<string, Song>,
): SongsInTable {
  const nodes: IRowNode[] = [];
  let clickedNode: IRowNode | undefined = undefined;
  gridApi.forEachNodeAfterFilterAndSort((node) => {
    nodes.push(node);
    if (clickedSongKey !== undefined && node.data?.key === clickedSongKey) {
      clickedNode = node;
    }
  });

  const clickedSong =
    clickedNode !== undefined
      ? convertNodeToSong(songsMap, clickedNode)
      : undefined;
  const sortedSongs: Song[] = [];
  const selectedSortedSongs: Song[] = [];
  nodes.forEach((node) => {
    const song = convertNodeToSong(songsMap, node);
    if (song !== undefined) {
      sortedSongs.push(song);
      if (node.isSelected()) {
        selectedSortedSongs.push(song);
      }
    }
  });

  return {
    clickedSong,
    sortedSongs,
    selectedSortedSongs,
  };
}

/**
 * Sorts songs by given columns.
 * @param songs Songs.
 * @param columns Columns.
 * @returns Sorted songs.
 */
export function sortSongsByColumns(
  songs: Song[],
  columns: SongTableColumn[],
): Song[] {
  const conditions = columns
    .filter((column) => (column.sortOrder ?? -1) >= 0)
    .sort((a, b) => a.sortOrder! - b.sortOrder!);
  return songs.sort((a, b) => {
    for (const condition of conditions) {
      const comp = SongUtils.compareSongsByMetadataValue(a, b, condition.tag);
      if (comp !== 0) {
        return condition.isSortDesc ? -comp : comp;
      }
    }
    return 0;
  });
}

export function createNewSongTableStateFromColumns(
  columns: SongTableColumn[],
  baseSongTableState: SongTableState,
  isSortingEnabled: boolean,
): SongTableState {
  const newState = baseSongTableState.clone();
  if (isSortingEnabled) {
    newState.columns = columns;
  } else {
    newState.columns = copySortingAttributesToNewColumns(
      columns,
      baseSongTableState.columns,
    );
  }
  return newState;
}
