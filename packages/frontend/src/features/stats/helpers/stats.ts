import { Song, Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";

export function getCountDistinct(songs: Song[], tag: Song_MetadataTag) {
  return [
    ...new Set(
      songs.map((song) => SongUtils.getSongMetadataAsString(song, tag)),
    ),
  ].length;
}
