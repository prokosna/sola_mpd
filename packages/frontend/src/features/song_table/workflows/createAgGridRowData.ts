import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";

import {
  SONGS_TAG_COMPACT,
  SongTableKeyType,
  SongTableRowData,
} from "../types/songTable";
import {
  convertSongToSongTableRowCompact,
  convertSongMetadataToSongTableRowKeyValue,
  getTableKeyOfSong,
  sortSongsByColumns,
} from "../utils/songTable";

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
