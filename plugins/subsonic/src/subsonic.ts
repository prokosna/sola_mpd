import { createHash, randomBytes } from "node:crypto";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { getSongMetadataAsString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { LRUCache } from "lru-cache";

import {
	SubsonicCreatePlaylistResponseSchema,
	SubsonicGetPlaylistResponseSchema,
	SubsonicGetPlaylistsResponseSchema,
	type SubsonicPlaylist,
	SubsonicSearch3ResponseSchema,
	type SubsonicSong,
} from "./types.js";

const fetchRetry = async (
	url: string,
	options: RequestInit,
	n = 3,
): Promise<Response> => {
	try {
		return await fetch(url, options);
	} catch (err) {
		if (n === 1) throw err;
		return await fetchRetry(url, options, n - 1);
	}
};

export class SubsonicClient {
	private cache: LRUCache<string, SubsonicSong[]>;
	private url: string;

	constructor(
		url: string,
		private user: string,
		private password: string,
	) {
		this.url = url.replace(/\/+$/, "");
		this.cache = new LRUCache({ max: 500 });
	}

	async find(song: Song): Promise<SubsonicSong | undefined> {
		const title = getSongMetadataAsString(song, Song_MetadataTag.TITLE);
		const artist = getSongMetadataAsString(song, Song_MetadataTag.ARTIST);
		const album = getSongMetadataAsString(song, Song_MetadataTag.ALBUM);
		const queries = [album, artist, title];
		for (const query of queries) {
			if (query === "") {
				continue;
			}
			let songs: SubsonicSong[] = [];
			if (this.cache.has(query)) {
				// biome-ignore lint/style/noNonNullAssertion: Already checked by has().
				songs = this.cache.get(query)!;
			} else {
				// Sometimes Subsonic search returns an empty result even though there should be some results.
				// Retry several times per query.
				let count = 0;
				while (count < 10) {
					songs = await this.search(query);
					this.cache.set(query, songs);
					if (songs.length === 0) {
						count += 1;
						continue;
					}
					break;
				}
			}
			for (const song of songs) {
				if (
					(title === "" || song.title === title) &&
					(artist === "" || song.artist === artist) &&
					(album === "" || song.album === album)
				) {
					return song;
				}
			}
		}
		return;
	}

	diff(targetSongs: Song[], existingSongs: SubsonicSong[]): Song[] | undefined {
		for (const [index, existingSong] of existingSongs.entries()) {
			if (index >= targetSongs.length) {
				return;
			}
			const targetSong = targetSongs[index];
			if (!this.equal(targetSong, existingSong)) {
				return;
			}
		}
		const toAddSongs: Song[] = [];
		for (const [index, targetSong] of targetSongs.entries()) {
			if (index >= existingSongs.length) {
				toAddSongs.push(targetSong);
			}
		}
		return toAddSongs;
	}

	async getOrCreatePlaylist(name: string): Promise<SubsonicPlaylist> {
		const endpoint = `${this.url}/getPlaylists`;
		const searchParams = this.createRequest(new Map());
		const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
		const data = SubsonicGetPlaylistsResponseSchema.parse(await resp.json());
		const playlists = data["subsonic-response"].playlists.playlist ?? [];
		const targetPlaylists = playlists.filter(
			(playlist) => playlist.name === name,
		);
		if (targetPlaylists.length > 0) {
			return targetPlaylists[0];
		}
		return this.createPlaylist(name);
	}

	async add(song: SubsonicSong, playlist: SubsonicPlaylist): Promise<void> {
		const endpoint = `${this.url}/updatePlaylist`;
		const searchParams = this.createRequest(
			new Map([
				["playlistId", playlist.id],
				["songIdToAdd", song.id],
			]),
		);
		await fetchRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
	}

	async delete(playlist: SubsonicPlaylist): Promise<void> {
		const endpoint = `${this.url}/deletePlaylist`;
		const searchParams = this.createRequest(new Map([["id", playlist.id]]));
		await fetchRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
		return;
	}

	async fetchSongs(playlist: SubsonicPlaylist): Promise<SubsonicSong[]> {
		const endpoint = `${this.url}/getPlaylist`;
		const searchParams = this.createRequest(new Map([["id", playlist.id]]));
		const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
		const data = SubsonicGetPlaylistResponseSchema.parse(await resp.json());
		return data["subsonic-response"].playlist.entry ?? [];
	}

	private equal(a: Song, b: SubsonicSong): boolean {
		const title = getSongMetadataAsString(a, Song_MetadataTag.TITLE);
		const artist = getSongMetadataAsString(a, Song_MetadataTag.ARTIST);
		const album = getSongMetadataAsString(a, Song_MetadataTag.ALBUM);
		return b.title === title && b.artist === artist && b.album === album;
	}

	async search(query: string): Promise<SubsonicSong[]> {
		const endpoint = `${this.url}/search3`;
		const searchParams = this.createRequest(
			new Map([
				["query", query],
				["songCount", "10000"],
			]),
		);
		const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
		const data = SubsonicSearch3ResponseSchema.parse(await resp.json());
		return data["subsonic-response"].searchResult3.song ?? [];
	}

	private async createPlaylist(name: string): Promise<SubsonicPlaylist> {
		const endpoint = `${this.url}/createPlaylist`;
		const searchParams = this.createRequest(new Map([["name", name]]));
		const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
		const data = SubsonicCreatePlaylistResponseSchema.parse(await resp.json());
		return data["subsonic-response"].playlist;
	}

	private createRequest(options: Map<string, string>): URLSearchParams {
		const salt = randomBytes(6).toString("hex");
		const token = createHash("md5")
			.update(this.password + salt)
			.digest("hex");

		const preset = new Map<string, string>([
			["u", this.user],
			["t", token],
			["s", salt],
			["v", "1.16.0"],
			["c", "sola_mpd"],
			["f", "json"],
		]);
		const parameters = new Map([...preset, ...options]);
		const searchParams = new URLSearchParams();
		for (const key of Object.keys(Object.fromEntries(parameters))) {
			const param = parameters.get(key);
			if (param === undefined) {
				continue;
			}
			searchParams.set(key, param);
		}
		return searchParams;
	}
}
