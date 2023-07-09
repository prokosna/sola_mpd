import { Song, SongMetadataTag } from "./models/song";
import { getSongMetadataAsString, sleep } from "./utils";

type AstigaSong = {
  id: string;
  title: string;
  artist: string;
  album: string;
};

const fetchRetry = async (url: string, options: RequestInit, n = 3) => {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (n === 1) throw err;
    return await fetchRetry(url, options, n - 1);
  }
};

export class AstigaClient {
  private cache: Map<string, AstigaSong[]>;

  constructor(
    private url: string,
    private user: string,
    private password: string,
  ) {
    this.url = this.url.replace(/\/+$/, "");
    this.cache = new Map();
  }

  async find(song: Song): Promise<AstigaSong | undefined> {
    const title = getSongMetadataAsString(song, SongMetadataTag.TITLE);
    const artist = getSongMetadataAsString(song, SongMetadataTag.ARTIST);
    const album = getSongMetadataAsString(song, SongMetadataTag.ALBUM);
    const queries = [
      this.makeQuery(undefined, album, undefined),
      this.makeQuery(undefined, album, artist),
      this.makeQuery(undefined, undefined, artist),
      this.makeQuery(title, undefined, artist),
      this.makeQuery(title, undefined, undefined),
    ];
    for (const query of queries) {
      let songs: AstigaSong[];
      if (this.cache.has(query)) {
        songs = this.cache.get(query);
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

  async getOrCreatePlaylist(name: string): Promise<string> {
    const endpoint = `${this.url}/getPlaylists`;
    const searchParams = this.createRequest(new Map());
    try {
      const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
        method: "GET",
      });
      const data = await resp.json();
      const playlists = data["subsonic-response"]["playlists"]["playlist"];
      const targetPlaylists = playlists.filter((v) => v["name"] === name);
      if (targetPlaylists.length > 0) {
        return targetPlaylists[0]["id"];
      }
      return this.createPlaylist(name);
    } catch (e) {
      throw e;
    }
  }

  async add(song: AstigaSong, playlist: string): Promise<void> {
    const endpoint = `${this.url}/updatePlaylist`;
    const searchParams = this.createRequest(
      new Map([
        ["playlistId", playlist],
        ["songIdToAdd", song.id],
      ]),
    );
    try {
      await fetchRetry(`${endpoint}?${searchParams}`, {
        method: "GET",
      });
    } catch (e) {
      throw e;
    }
  }

  async delete(playlist: string): Promise<void> {
    const endpoint = `${this.url}/deletePlaylist`;
    const searchParams = this.createRequest(new Map([["id", playlist]]));
    try {
      await fetchRetry(`${endpoint}?${searchParams}`, {
        method: "GET",
      });
      return;
    } catch (e) {
      throw e;
    }
  }

  async fetchSongs(playlist: string): Promise<AstigaSong[]> {
    const endpoint = `${this.url}/getPlaylist`;
    const searchParams = this.createRequest(new Map([["id", playlist]]));
    try {
      const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
        method: "GET",
      });
      const data = await resp.json();
      const songs = data["subsonic-response"]["playlist"]["entry"];
      return songs.map((v) => this.parse(v));
    } catch (e) {
      throw e;
    }
  }

  private parse(v: any): AstigaSong {
    return {
      id: v["id"],
      title: v["title"] || "",
      album: v["album"] || "",
      artist: v["artist"] || "",
    };
  }

  private equal(a: Song, b: AstigaSong): boolean {
    const title = getSongMetadataAsString(a, SongMetadataTag.TITLE);
    const artist = getSongMetadataAsString(a, SongMetadataTag.ARTIST);
    const album = getSongMetadataAsString(a, SongMetadataTag.ALBUM);
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
    try {
      const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
        method: "GET",
      });
      const data = await resp.json();
      const songs = data["subsonic-response"]["searchResult3"]["song"];
      return songs.map((v) => this.parse(v));
    } catch (e) {
      throw e;
    }
  }

  private async createPlaylist(name: string): Promise<string> {
    const endpoint = `${this.url}/createPlaylist`;
    const searchParams = this.createRequest(new Map([["name", name]]));
    try {
      const resp = await fetchRetry(`${endpoint}?${searchParams}`, {
        method: "GET",
      });
      const data = await resp.json();
      const playlist = data["subsonic-response"]["playlist"];
      return playlist["id"];
    } catch (e) {
      throw e;
    }
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
    Object.keys(Object.fromEntries(parameters)).forEach((k) =>
      searchParams.set(k, parameters.get(k)),
    );
    return searchParams;
  }

  private escape(src: string): string {
    // https://manual.manticoresearch.com/Searching/Full_text_matching/Escaping
    const chs: string[] = [
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
    ];

    let dest: string = src;
    for (const ch of chs) {
      dest = dest.split(ch).join(`\\${ch}`);
    }
    return dest;
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
