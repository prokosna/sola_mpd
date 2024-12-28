import { Song, Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { getSongMetadataAsString } from "@sola_mpd/domain/src/utils/songUtils.js";
import { LRUCache } from "lru-cache";

import {
  AstigaCreatePlaylistResponseSchema,
  AstigaGetPlaylistResponseSchema,
  AstigaGetPlaylistsResponseSchema,
  AstigaPlaylist,
  AstigaSearch3ResponseSchema,
  AstigaSong,
} from "./types.js";
import { sleep } from "./utils.js";

// https://manual.manticoresearch.com/Searching/Full_text_matching/Escaping
const specialCharacters: string[] = [
  "\\",
  "!",
  '"',
  "$",
  "'",
  "(",
  ")",
  "-",
  "/",
  "<",
  "@",
  "^",
  "|",
  "~",
  "*",
];

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

export class AstigaClient {
  private cache: LRUCache<string, AstigaSong[]>;

  constructor(
    private url: string,
    private user: string,
    private password: string,
  ) {
    this.url = this.url.replace(/\/+$/, "");
    this.cache = new LRUCache({ max: 500 });
  }

  async find(song: Song): Promise<AstigaSong | undefined> {
    const title = getSongMetadataAsString(song, Song_MetadataTag.TITLE);
    const artist = getSongMetadataAsString(song, Song_MetadataTag.ARTIST);
    const album = getSongMetadataAsString(song, Song_MetadataTag.ALBUM);
    const queries = [
      this.makeQuery(undefined, album, undefined),
      this.makeQuery(undefined, undefined, artist),
      this.makeQuery(undefined, album, artist),
      this.makeQuery(title, undefined, undefined),
      this.makeQuery(
        this.replaceSpecialCharactersWithSpaces(title),
        undefined,
        undefined,
      ),
    ];
    for (const query of queries) {
      let songs: AstigaSong[] = [];
      if (this.cache.has(query)) {
        songs = this.cache.get(query)!;
      } else {
        // Sometimes Astiga search returns an empty result even though there should be some results.
        // Retry several times per query.
        let count = 0;
        while (count < 10) {
          songs = await this.search(query);
          this.cache.set(query, songs);
          if (songs.length == 0) {
            await sleep(100);
            count += 1;
            continue;
          }
          break;
        }
      }
      for (const song of songs) {
        if (
          song.title === title &&
          song.artist === artist &&
          song.album === album
        ) {
          return song;
        }
      }
      await sleep(100);
    }
    return;
  }

  diff(targetSongs: Song[], existingSongs: AstigaSong[]): Song[] | undefined {
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

  async getOrCreatePlaylist(name: string): Promise<AstigaPlaylist> {
    const endpoint = `${this.url}/getPlaylists`;
    const searchParams = this.createRequest(new Map());
    const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
      method: "GET",
    });
    const data = AstigaGetPlaylistsResponseSchema.parse(await resp.json());
    const playlists = data["subsonic-response"].playlists.playlist;
    const targetPlaylists = playlists.filter(
      (playlist) => playlist["name"] === name,
    );
    if (targetPlaylists.length > 0) {
      return targetPlaylists[0];
    }
    return this.createPlaylist(name);
  }

  async add(song: AstigaSong, playlist: AstigaPlaylist): Promise<void> {
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

  async delete(playlist: AstigaPlaylist): Promise<void> {
    const endpoint = `${this.url}/deletePlaylist`;
    const searchParams = this.createRequest(new Map([["id", playlist.id]]));
    await fetchRetry(`${endpoint}?${searchParams}`, {
      method: "GET",
    });
    return;
  }

  async fetchSongs(playlist: AstigaPlaylist): Promise<AstigaSong[]> {
    const endpoint = `${this.url}/getPlaylist`;
    const searchParams = this.createRequest(new Map([["id", playlist.id]]));
    const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
      method: "GET",
    });
    const data = AstigaGetPlaylistResponseSchema.parse(await resp.json());
    return data["subsonic-response"].playlist.entry;
  }

  private equal(a: Song, b: AstigaSong): boolean {
    const title = getSongMetadataAsString(a, Song_MetadataTag.TITLE);
    const artist = getSongMetadataAsString(a, Song_MetadataTag.ARTIST);
    const album = getSongMetadataAsString(a, Song_MetadataTag.ALBUM);
    return b.title === title && b.artist === artist && b.album === album;
  }

  async search(query: string): Promise<AstigaSong[]> {
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
    const data = AstigaSearch3ResponseSchema.parse(await resp.json());
    return data["subsonic-response"].searchResult3.song;
  }

  private async createPlaylist(name: string): Promise<AstigaPlaylist> {
    const endpoint = `${this.url}/createPlaylist`;
    const searchParams = this.createRequest(new Map([["name", name]]));
    const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
      method: "GET",
    });
    const data = AstigaCreatePlaylistResponseSchema.parse(await resp.json());
    return data["subsonic-response"]["playlist"];
  }

  private createRequest(options: Map<string, string>): URLSearchParams {
    const preset = new Map<string, string>([
      ["u", this.user],
      ["p", "enc:" + Buffer.from(this.password, "utf-8").toString("hex")],
      ["v", "1.16.0"],
      ["c", "sola_mpd"],
      ["f", "json"],
    ]);
    const parameters = new Map([...preset, ...options]);
    const searchParams = new URLSearchParams();
    Object.keys(Object.fromEntries(parameters)).forEach((key) =>
      searchParams.set(key, parameters.get(key)!),
    );
    return searchParams;
  }

  private escape(src: string): string {
    let dest: string = src;
    for (const ch of specialCharacters) {
      dest = dest.split(ch).join(`\\${ch}`);
    }
    return dest;
  }

  private replaceSpecialCharactersWithSpaces(src: string): string {
    const pattern = new RegExp(`[${specialCharacters.join("")}]`, "g");
    return src.replace(pattern, " ");
  }

  private makeQuery(
    title: string | undefined,
    album: string | undefined,
    artist: string | undefined,
  ): string {
    let query = "";
    if (title !== undefined && title !== "") {
      query += `@title "${this.escape(title)}"`;
    }
    if (album !== undefined && album !== "") {
      if (query !== "") {
        query += " ";
      }
      query += `@album "${this.escape(album)}"`;
    }
    if (artist !== undefined && artist !== "") {
      if (query !== "") {
        query += " ";
      }
      query += `@artist "${this.escape(artist)}"`;
    }
    return query;
  }
}
