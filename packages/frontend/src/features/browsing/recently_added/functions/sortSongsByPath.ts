import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

/**
 * Sort songs by `path` ascending to mirror MPD's default ordering.
 */
export function sortSongsByPath(songs: Song[]): Song[] {
	return [...songs].sort((a, b) => {
		if (a.path < b.path) {
			return -1;
		}
		if (a.path > b.path) {
			return 1;
		}
		return 0;
	});
}
