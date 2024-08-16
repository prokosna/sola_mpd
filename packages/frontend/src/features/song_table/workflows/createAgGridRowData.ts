import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";

import {
  SONGS_TAG_COMPACT,
  SongTableKeyType,
  SongTableRowData,
} from "../types/songTableTypes";

import {
  convertSongToSongTableRowCompact,
  convertSongMetadataToSongTableRowKeyValue,
  getTableKeyOfSong,
} from "./convertAgGridTableSongs";

export function createAgGridRowData(
  songs: Song[],
  keyType: SongTableKeyType,
  columns: SongTableColumn[],
): SongTableRowData[] {
  return songs.map((song) => {
    const row: SongTableRowData = {};
    row.key = getTableKeyOfSong(song, keyType);
    for (const column of columns) {
      const [tag, value] = convertSongMetadataToSongTableRowKeyValue(
        column.tag,
        song.metadata[column.tag],
      );
      row[tag] = value;
    }
    return row;
  });
}

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

export function createAgGridRowDataCompact(
  songs: Song[],
  keyType: SongTableKeyType,
  columns: SongTableColumn[],
  isSortingEnabled: boolean,
): SongTableRowData[] {
  return (isSortingEnabled ? sortSongsByColumns(songs, columns) : songs).map(
    (song) => {
      const row: SongTableRowData = {};
      row.key = getTableKeyOfSong(song, keyType);
      row[SONGS_TAG_COMPACT] = convertSongToSongTableRowCompact(song);
      return row;
    },
  );
}
