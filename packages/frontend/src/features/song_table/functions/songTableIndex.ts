import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

export function assignSongIndices(songs: Song[]): Song[] {
	return songs.map((song, index) => {
		song.index = index;
		return song;
	});
}
