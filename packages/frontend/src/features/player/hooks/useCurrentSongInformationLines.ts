import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { useMemo } from "react";

import { useCurrentSongState } from "../states/song";

export function useCurrentSongInformationLines() {
  const song = useCurrentSongState();

  const firstLine = useMemo(() => {
    if (song === undefined) {
      return "Not playing";
    }
    return SongUtils.getSongMetadataAsString(song, Song_MetadataTag.TITLE);
  }, [song]);

  const secondLine = useMemo(() => {
    if (song === undefined) {
      return "";
    }
    return SongUtils.getSongMetadataAsString(song, Song_MetadataTag.ALBUM);
  }, [song]);

  const thirdLine = useMemo(() => {
    if (song === undefined) {
      return "";
    }
    const artist = SongUtils.getSongMetadataAsString(
      song,
      Song_MetadataTag.ARTIST,
    );
    const albumArtist = SongUtils.getSongMetadataAsString(
      song,
      Song_MetadataTag.ALBUM_ARTIST,
    );
    const composer = SongUtils.getSongMetadataAsString(
      song,
      Song_MetadataTag.COMPOSER,
    );
    const date = SongUtils.getSongMetadataAsString(song, Song_MetadataTag.DATE);
    let text = "";
    text += artist !== "" ? artist : albumArtist;
    text += composer !== "" ? ` / ${composer}` : "";
    text += date !== "" ? ` (${date})` : "";
    return text;
  }, [song]);

  return { firstLine, secondLine, thirdLine };
}
