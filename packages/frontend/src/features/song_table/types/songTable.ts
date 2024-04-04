import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";

/**
 * What value is used for the row key in a song table
 */
export enum SongTableKeyType {
  PATH = "PATH",
  INDEX_PATH = "INDEX_PATH",
  ID = "ID",
}

export const SONGS_TAG_COMPACT = "songs";

export type SongTableRowCompact = {
  firstLine: string;
  secondLine: string;
};

export type SongTableRowDataType = {
  [tag: string]: string | number | Date | SongTableRowCompact | undefined;
};

/**
 * Utility type to get songs in a table with its index (position)
 */
export type SongsInTable = {
  clickedSong: Song | undefined;
  sortedSongs: Song[];
  selectedSortedSongs: Song[];
};

export type SongTableContextMenuItemParams = {
  columns: SongTableColumn[];
  clickedSong: Song;
  sortedSongs: Song[];
  selectedSortedSongs: Song[];
};
