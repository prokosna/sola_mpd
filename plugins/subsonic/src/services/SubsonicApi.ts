import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { SubsonicPlaylist, SubsonicSong } from "../types.js";

export interface SubsonicApi {
	find(song: Song): Promise<SubsonicSong | undefined>;
	getOrCreatePlaylist(name: string): Promise<SubsonicPlaylist>;
	add(song: SubsonicSong, playlist: SubsonicPlaylist): Promise<void>;
	delete(playlist: SubsonicPlaylist): Promise<void>;
	fetchSongs(playlist: SubsonicPlaylist): Promise<SubsonicSong[]>;
}
