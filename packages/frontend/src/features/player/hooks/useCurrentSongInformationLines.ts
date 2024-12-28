import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { getSongMetadataAsString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { useMemo } from "react";

import { useCurrentSongState } from "../states/playerSongState";

/**
 * A custom hook that provides information about the currently playing song.
 *
 * @returns An object containing three lines of information about the current song:
 *   - firstLine: Usually the song title
 *   - secondLine: Usually the artist name
 *   - thirdLine: Usually the album name
 *
 * If no song is currently playing, appropriate default values are returned.
 */
export function useCurrentSongInformationLines() {
  const song = useCurrentSongState();

  const firstLine = useMemo(() => {
    if (song === undefined) {
      return "Not playing";
    }
    return getSongMetadataAsString(song, Song_MetadataTag.TITLE);
  }, [song]);

  const secondLine = useMemo(() => {
    if (song === undefined) {
      return "";
    }
    return getSongMetadataAsString(song, Song_MetadataTag.ALBUM);
  }, [song]);

  const thirdLine = useMemo(() => {
    if (song === undefined) {
      return "";
    }
    const artist = getSongMetadataAsString(song, Song_MetadataTag.ARTIST);
    const albumArtist = getSongMetadataAsString(
      song,
      Song_MetadataTag.ALBUM_ARTIST,
    );
    const composer = getSongMetadataAsString(song, Song_MetadataTag.COMPOSER);
    const date = getSongMetadataAsString(song, Song_MetadataTag.DATE);
    let text = "";
    text += artist !== "" ? artist : albumArtist;
    text += composer !== "" ? ` / ${composer}` : "";
    text += date !== "" ? ` (${date})` : "";
    return text;
  }, [song]);

  return { firstLine, secondLine, thirdLine };
}
