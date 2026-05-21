import { createHash, randomBytes } from "node:crypto";
import { getSongMetadataAsString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type Song,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { LRUCache } from "lru-cache";
import pRetry from "p-retry";

import {
	SubsonicCreatePlaylistResponseSchema,
	SubsonicGetPlaylistResponseSchema,
	SubsonicGetPlaylistsResponseSchema,
	type SubsonicPlaylist,
	SubsonicSearch3ResponseSchema,
	type SubsonicSong,
} from "../types.js";
import type { SubsonicApi } from "./SubsonicApi.js";

const DEFAULT_FETCH_RETRIES = 2;
const DEFAULT_SEARCH_RETRIES = 9;
const DEFAULT_MIN_BACKOFF_MS = 100;
const DEFAULT_MAX_BACKOFF_MS = 2000;
const SEARCH_CACHE_MAX_ENTRIES = 500;

export interface SubsonicApiHttpOptions {
	/** Retry attempts after the initial fetch call on network errors. */
	fetchRetries?: number;
	/**
	 * Retry attempts after the initial search call when Subsonic returns an
	 * empty result. Subsonic's /search3 endpoint intermittently returns an
	 * empty result set for queries that should match, so we retry as a
	 * workaround.
	 */
	searchRetries?: number;
	minBackoffMs?: number;
	maxBackoffMs?: number;
}

class EmptySearchResultError extends Error {
	override readonly name = "EmptySearchResultError";
}

export class SubsonicApiHttp implements SubsonicApi {
	private cache: LRUCache<string, SubsonicSong[]>;
	private url: string;
	private fetchRetries: number;
	private searchRetries: number;
	private minBackoffMs: number;
	private maxBackoffMs: number;

	constructor(
		url: string,
		private user: string,
		private password: string,
		options: SubsonicApiHttpOptions = {},
	) {
		this.url = url.replace(/\/+$/, "");
		this.cache = new LRUCache({ max: SEARCH_CACHE_MAX_ENTRIES });
		this.fetchRetries = options.fetchRetries ?? DEFAULT_FETCH_RETRIES;
		this.searchRetries = options.searchRetries ?? DEFAULT_SEARCH_RETRIES;
		this.minBackoffMs = options.minBackoffMs ?? DEFAULT_MIN_BACKOFF_MS;
		this.maxBackoffMs = options.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
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
			let songs: SubsonicSong[];
			if (this.cache.has(query)) {
				// biome-ignore lint/style/noNonNullAssertion: Already checked by has().
				songs = this.cache.get(query)!;
			} else {
				songs = await this.searchWithRetry(query);
				this.cache.set(query, songs);
			}
			for (const candidate of songs) {
				if (
					(title === "" || candidate.title === title) &&
					(artist === "" || candidate.artist === artist) &&
					(album === "" || candidate.album === album)
				) {
					return candidate;
				}
			}
		}
		return;
	}

	async getOrCreatePlaylist(name: string): Promise<SubsonicPlaylist> {
		const endpoint = `${this.url}/getPlaylists`;
		const searchParams = this.createRequest(new Map());
		const resp = await this.fetchWithRetry(`${endpoint}?${searchParams}`, {
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
		await this.fetchWithRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
	}

	async delete(playlist: SubsonicPlaylist): Promise<void> {
		const endpoint = `${this.url}/deletePlaylist`;
		const searchParams = this.createRequest(new Map([["id", playlist.id]]));
		await this.fetchWithRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
	}

	async fetchSongs(playlist: SubsonicPlaylist): Promise<SubsonicSong[]> {
		const endpoint = `${this.url}/getPlaylist`;
		const searchParams = this.createRequest(new Map([["id", playlist.id]]));
		const resp = await this.fetchWithRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
		const data = SubsonicGetPlaylistResponseSchema.parse(await resp.json());
		return data["subsonic-response"].playlist.entry ?? [];
	}

	private fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
		return pRetry(() => fetch(url, options), {
			retries: this.fetchRetries,
			minTimeout: this.minBackoffMs,
			maxTimeout: this.maxBackoffMs,
			randomize: true,
		});
	}

	// Subsonic's /search3 occasionally returns an empty result set for queries
	// that should match. Treat empty as a retryable failure via a sentinel
	// error, then convert the exhausted sentinel back into an empty array so
	// genuinely-empty queries don't surface as exceptions.
	private async searchWithRetry(query: string): Promise<SubsonicSong[]> {
		try {
			return await pRetry(
				async () => {
					const songs = await this.search(query);
					if (songs.length === 0) {
						throw new EmptySearchResultError();
					}
					return songs;
				},
				{
					retries: this.searchRetries,
					minTimeout: this.minBackoffMs,
					maxTimeout: this.maxBackoffMs,
					randomize: true,
				},
			);
		} catch (err) {
			if (err instanceof EmptySearchResultError) {
				return [];
			}
			throw err;
		}
	}

	private async search(query: string): Promise<SubsonicSong[]> {
		const endpoint = `${this.url}/search3`;
		const searchParams = this.createRequest(
			new Map([
				["query", query],
				["songCount", "10000"],
			]),
		);
		const resp = await this.fetchWithRetry(`${endpoint}?${searchParams}`, {
			method: "GET",
		});
		const data = SubsonicSearch3ResponseSchema.parse(await resp.json());
		return data["subsonic-response"].searchResult3.song ?? [];
	}

	private async createPlaylist(name: string): Promise<SubsonicPlaylist> {
		const endpoint = `${this.url}/createPlaylist`;
		const searchParams = this.createRequest(new Map([["name", name]]));
		const resp = await this.fetchWithRetry(`${endpoint}?${searchParams}`, {
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
