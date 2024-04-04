import {
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { GridApi, IRowNode } from "ag-grid-community";
import dayjs from "dayjs";

import {
  SongTableContextMenuItemParams,
  SongTableKeyType,
  SongTableRowCompact,
  SongsInTable,
} from "../types/songTable";

export function convertNodeToSong(songsMap: Map<string, Song>, node: IRowNode) {
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

export function getTableKeyOfSong(song: Song, keyType: SongTableKeyType) {
  switch (keyType) {
    case SongTableKeyType.ID: {
      const id = SongUtils.getSongMetadataAsString(song, Song_MetadataTag.ID);
      if (id === "") {
        console.warn(`ID is specified as a song table key, but empty: ${song}`);
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
      throw Error(`Unsupported song table key: ${keyType}`);
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
      .map((song) => getTableKeyOfSong(song, keyType))
      .includes(getTableKeyOfSong(clickedSong, keyType))
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
    const currentSongKey = getTableKeyOfSong(currentSong, keyType);
    const orderedSongKey = getTableKeyOfSong(orderedSong, keyType);
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

export function getSongsInTableFromGrid(
  key: string | undefined,
  gridApi: GridApi,
  songsMap: Map<string, Song>,
): SongsInTable {
  const nodes: IRowNode[] = [];
  let targetNode: IRowNode | undefined = undefined;
  gridApi.forEachNodeAfterFilterAndSort((node) => {
    nodes.push(node);
    if (key !== undefined && node.data?.key === key) {
      targetNode = node;
    }
  });

  const clickedSong =
    targetNode !== undefined
      ? convertNodeToSong(songsMap, targetNode)
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
