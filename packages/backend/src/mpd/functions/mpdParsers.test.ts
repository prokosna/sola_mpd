import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import {
	AudioFormat_Encoding,
	Song_MetadataTag,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";
import {
	parseFolder,
	parseMpdOutputDevice,
	parseMpdPlayerStatus,
	parseMpdPlayerVolume,
	parseMpdStats,
	parsePlaylist,
	parseSong,
} from "./mpdParsers.js";

describe("parseSong", () => {
	it("returns a song with all fields populated", () => {
		const raw = {
			file: "music/artist/album/track.flac",
			Title: "My Track",
			Artist: "My Artist",
			"Album-Artist": "My Album Artist",
			Album: "My Album",
			Genre: "Rock",
			Composer: "Composer Name",
			Track: "5",
			Disc: "1",
			Date: "2020",
			duration: "245.3",
			format: "44100:16:2",
			"Last-Modified": "2023-01-15T10:00:00Z",
			Id: "42",
			Pos: "3",
			Comment: "a comment",
			Label: "my label",
		};

		const song = parseSong(raw);

		expect(song).toBeDefined();
		expect(song?.path).toBe("music/artist/album/track.flac");

		const title = song?.metadata[Song_MetadataTag.TITLE];
		expect(title?.value.case).toBe("stringValue");
		expect((title?.value as { value: { value: string } }).value.value).toBe(
			"My Track",
		);

		const track = song?.metadata[Song_MetadataTag.TRACK];
		expect(track?.value.case).toBe("intValue");
		expect((track?.value as { value: { value: number } }).value.value).toBe(5);

		const disc = song?.metadata[Song_MetadataTag.DISC];
		expect(disc?.value.case).toBe("intValue");
		expect((disc?.value as { value: { value: number } }).value.value).toBe(1);

		const format = song?.metadata[Song_MetadataTag.FORMAT];
		expect(format?.value.case).toBe("format");
		const audioFormat = (
			format?.value as {
				value: { samplingRate: number; bits: number; channels: number };
			}
		).value;
		expect(audioFormat.samplingRate).toBe(44100);
		expect(audioFormat.bits).toBe(16);
		expect(audioFormat.channels).toBe(2);
	});

	it("returns undefined when file field is missing", () => {
		const raw = { Title: "No File" };
		expect(parseSong(raw)).toBeUndefined();
	});

	it("returns undefined when input is undefined", () => {
		expect(parseSong(undefined)).toBeUndefined();
	});

	it("uses empty string for missing optional string fields", () => {
		const raw = { file: "path/to/song.mp3" };
		const song = parseSong(raw);
		expect(song).toBeDefined();

		const title = song?.metadata[Song_MetadataTag.TITLE];
		expect(title?.value.case).toBe("stringValue");
		expect((title?.value as { value: { value: string } }).value.value).toBe("");
	});

	it("uses string value for non-numeric track field", () => {
		const raw = { file: "path/to/song.mp3", Track: "not-a-number" };
		const song = parseSong(raw);
		const track = song?.metadata[Song_MetadataTag.TRACK];
		expect(track?.value.case).toBe("stringValue");
	});

	it("parses PCM audio format", () => {
		const raw = { file: "path/to/song.mp3", format: "96000:24:2" };
		const song = parseSong(raw);
		const format = song?.metadata[Song_MetadataTag.FORMAT];
		const audioFormat = (
			format?.value as {
				value: {
					encoding: number;
					samplingRate: number;
					bits: number;
					channels: number;
				};
			}
		).value;
		expect(audioFormat.encoding).toBe(AudioFormat_Encoding.PCM);
		expect(audioFormat.samplingRate).toBe(96000);
		expect(audioFormat.bits).toBe(24);
		expect(audioFormat.channels).toBe(2);
	});

	it("parses DSD audio format", () => {
		const raw = { file: "path/to/song.dsf", format: "dsd256:1" };
		const song = parseSong(raw);
		const format = song?.metadata[Song_MetadataTag.FORMAT];
		const audioFormat = (
			format?.value as {
				value: { encoding: number; samplingRate: number; channels: number };
			}
		).value;
		expect(audioFormat.encoding).toBe(AudioFormat_Encoding.DSD);
		expect(audioFormat.samplingRate).toBe(256);
		expect(audioFormat.channels).toBe(1);
	});

	it("normalizes hyphenated and underscored keys", () => {
		const raw = {
			file: "path/to/song.mp3",
			"Album-Artist": "Artist Name",
			"Last-Modified": "2023-06-01T00:00:00Z",
		};
		const song = parseSong(raw);
		expect(song).toBeDefined();
		const albumArtist = song?.metadata[Song_MetadataTag.ALBUM_ARTIST];
		expect(
			(albumArtist?.value as { value: { value: string } }).value.value,
		).toBe("Artist Name");
	});

	it("joins array values with semicolons", () => {
		const raw = { file: "path/to/song.mp3", Artist: ["Artist A", "Artist B"] };
		const song = parseSong(raw);
		const artist = song?.metadata[Song_MetadataTag.ARTIST];
		expect((artist?.value as { value: { value: string } }).value.value).toBe(
			"Artist A; Artist B",
		);
	});

	it("parses Added attribute into ADDED_AT timestamp", () => {
		const raw = {
			file: "path/to/song.mp3",
			Added: "2024-03-15T10:30:00Z",
		};
		const song = parseSong(raw);
		const addedAt = song?.metadata[Song_MetadataTag.ADDED_AT];
		expect(addedAt?.value.case).toBe("timestamp");
		const seconds = (addedAt?.value as { value: { seconds: bigint } }).value
			.seconds;
		expect(Number(seconds)).toBe(
			Math.floor(new Date("2024-03-15T10:30:00Z").getTime() / 1000),
		);
	});

	it("leaves ADDED_AT unset when Added is absent", () => {
		const raw = { file: "path/to/song.mp3" };
		const song = parseSong(raw);
		expect(song?.metadata[Song_MetadataTag.ADDED_AT]).toBeUndefined();
	});

	it("leaves ADDED_AT unset when Added is unparseable or negative", () => {
		const songNeg = parseSong({ file: "path/to/song.mp3", Added: "-1" });
		expect(songNeg?.metadata[Song_MetadataTag.ADDED_AT]).toBeUndefined();

		const songJunk = parseSong({ file: "path/to/song.mp3", Added: "garbage" });
		expect(songJunk?.metadata[Song_MetadataTag.ADDED_AT]).toBeUndefined();
	});
});

describe("parseMpdStats", () => {
	it("returns stats with all fields populated", () => {
		const raw = {
			artists: "100",
			albums: "50",
			songs: "1000",
			uptime: "3600",
			playtime: "720",
			db_playtime: "86400",
			db_update: "1700000000",
		};
		const stats = parseMpdStats("0.23.5", raw);
		expect(stats).toBeDefined();
		expect(stats?.version).toBe("0.23.5");
		expect(stats?.artistsCount).toBe(100);
		expect(stats?.albumsCount).toBe(50);
		expect(stats?.songsCount).toBe(1000);
		expect(stats?.uptime).toBe(3600);
		expect(stats?.playtime).toBe(720);
		expect(stats?.totalPlaytime).toBe(86400);
	});

	it("returns undefined when input is undefined", () => {
		expect(parseMpdStats("0.23.5", undefined)).toBeUndefined();
	});

	it("defaults numeric fields to 0 for invalid values", () => {
		const raw = {
			artists: "not-a-number",
			albums: "",
			songs: "1000",
			uptime: "0",
			playtime: "0",
			db_playtime: "0",
			db_update: "0",
		};
		const stats = parseMpdStats("0.23.5", raw);
		expect(stats?.artistsCount).toBe(0);
		expect(stats?.albumsCount).toBe(0);
	});
});

describe("parseMpdOutputDevice", () => {
	it("returns an output device with all fields", () => {
		const raw = {
			outputid: "0",
			outputname: "My Speaker",
			plugin: "alsa",
			outputenabled: "1",
		};
		const device = parseMpdOutputDevice(raw);
		expect(device).toBeDefined();
		expect(device?.id).toBe(0);
		expect(device?.name).toBe("My Speaker");
		expect(device?.plugin).toBe("alsa");
		expect(device?.isEnabled).toBe(true);
	});

	it("returns undefined when input is undefined", () => {
		expect(parseMpdOutputDevice(undefined)).toBeUndefined();
	});

	it("sets isEnabled false when outputenabled is 0", () => {
		const raw = {
			outputid: "1",
			outputname: "Disabled Output",
			plugin: "null",
			outputenabled: "0",
		};
		const device = parseMpdOutputDevice(raw);
		expect(device?.isEnabled).toBe(false);
	});

	it("sets id to -1 when outputid is missing", () => {
		const raw = {
			outputname: "No Id Output",
			plugin: "alsa",
			outputenabled: "1",
		};
		const device = parseMpdOutputDevice(raw);
		expect(device?.id).toBe(-1);
	});
});

describe("parsePlaylist", () => {
	it("returns a playlist with name and updatedAt", () => {
		const raw = {
			playlist: "my-playlist",
			"Last-Modified": "2023-03-10T12:00:00Z",
		};
		const playlist = parsePlaylist(raw);
		expect(playlist).toBeDefined();
		expect(playlist?.name).toBe("my-playlist");
		expect(playlist?.updatedAt).toBeDefined();
	});

	it("returns undefined when input is undefined", () => {
		expect(parsePlaylist(undefined)).toBeUndefined();
	});

	it("returns undefined when playlist name is empty", () => {
		const raw = { playlist: "" };
		expect(parsePlaylist(raw)).toBeUndefined();
	});

	it("returns undefined when playlist field is missing", () => {
		const raw = { "Last-Modified": "2023-01-01T00:00:00Z" };
		expect(parsePlaylist(raw)).toBeUndefined();
	});
});

describe("parseFolder", () => {
	it("returns a folder with the directory path", () => {
		const raw = { directory: "music/rock" };
		const folder = parseFolder(raw);
		expect(folder).toBeDefined();
		expect(folder?.path).toBe("music/rock");
	});

	it("returns undefined when input is undefined", () => {
		expect(parseFolder(undefined)).toBeUndefined();
	});

	it("returns undefined when directory path is empty", () => {
		const raw = { directory: "" };
		expect(parseFolder(raw)).toBeUndefined();
	});
});

describe("parseMpdPlayerVolume", () => {
	it("returns volume from valid input", () => {
		const raw = { volume: "75" };
		const vol = parseMpdPlayerVolume(raw);
		expect(vol).toBeDefined();
		expect(vol?.volume).toBe(75);
	});

	it("returns volume -1 when input is undefined", () => {
		const vol = parseMpdPlayerVolume(undefined);
		expect(vol).toBeDefined();
		expect(vol?.volume).toBe(-1);
	});

	it("returns volume -1 when volume field is missing", () => {
		const raw = {};
		const vol = parseMpdPlayerVolume(raw);
		expect(vol?.volume).toBe(-1);
	});
});

describe("parseMpdPlayerStatus", () => {
	it("returns status with all fields populated for playing state", () => {
		const raw = {
			repeat: "1",
			random: "0",
			single: "0",
			consume: "1",
			playlistlength: "20",
			state: "play",
			song: "3",
			songid: "42",
			nextsong: "4",
			nextsongid: "43",
			elapsed: "120.5",
			duration: "245.0",
			bitrate: "320",
			audio: "44100:16:2",
		};
		const status = parseMpdPlayerStatus(raw);
		expect(status).toBeDefined();
		expect(status?.isRepeat).toBe(true);
		expect(status?.isRandom).toBe(false);
		expect(status?.isSingle).toBe(false);
		expect(status?.isConsume).toBe(true);
		expect(status?.playQueueLength).toBe(20);
		expect(status?.song).toBe(3);
		expect(status?.songId).toBe(42);
		expect(status?.elapsed).toBe(120.5);
		expect(status?.duration).toBe(245.0);
		expect(status?.bitrate).toBe(320);
	});

	it("returns undefined when input is undefined", () => {
		expect(parseMpdPlayerStatus(undefined)).toBeUndefined();
	});

	it("sets playbackState to STOP for stop state", () => {
		const raw = { state: "stop" };
		const status = parseMpdPlayerStatus(raw);
		expect(status?.playbackState).toBe(MpdPlayerStatus_PlaybackState.STOP);
	});

	it("sets playbackState to PAUSE for pause state", () => {
		const raw = { state: "pause" };
		const status = parseMpdPlayerStatus(raw);
		expect(status?.playbackState).toBe(MpdPlayerStatus_PlaybackState.PAUSE);
	});

	it("sets playbackState to UNKNOWN for unrecognized state", () => {
		const raw = { state: "something-else" };
		const status = parseMpdPlayerStatus(raw);
		expect(status?.playbackState).toBe(MpdPlayerStatus_PlaybackState.UNKNOWN);
	});

	it("sets isDatabaseUpdating true when updatingdb is present", () => {
		const raw = { state: "play", updatingdb: "1" };
		const status = parseMpdPlayerStatus(raw);
		expect(status?.isDatabaseUpdating).toBe(true);
	});

	it("sets isDatabaseUpdating false when updatingdb is absent", () => {
		const raw = { state: "play" };
		const status = parseMpdPlayerStatus(raw);
		expect(status?.isDatabaseUpdating).toBe(false);
	});
});
