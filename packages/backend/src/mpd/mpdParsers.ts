import { create } from "@bufbuild/protobuf";
import {
	FloatValueSchema,
	Int32ValueSchema,
	StringValueSchema,
	TimestampSchema,
	timestampFromDate,
} from "@bufbuild/protobuf/wkt";
import type { Folder } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import { FolderSchema } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import type { MpdOutputDevice } from "@sola_mpd/domain/src/models/mpd/mpd_output_pb.js";
import { MpdOutputDeviceSchema } from "@sola_mpd/domain/src/models/mpd/mpd_output_pb.js";

import {
	type MpdPlayerStatus,
	MpdPlayerStatus_PlaybackState,
	MpdPlayerStatusSchema,
	type MpdPlayerVolume,
	MpdPlayerVolumeSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";
import type { MpdStats } from "@sola_mpd/domain/src/models/mpd/mpd_stats_pb.js";
import { MpdStatsSchema } from "@sola_mpd/domain/src/models/mpd/mpd_stats_pb.js";
import type { Playlist } from "@sola_mpd/domain/src/models/playlist_pb.js";
import { PlaylistSchema } from "@sola_mpd/domain/src/models/playlist_pb.js";

import {
	type AudioFormat,
	AudioFormat_Encoding,
	AudioFormatSchema,
	type Song,
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/domain/src/models/song_pb.js";

import dayjs from "dayjs";

function normalizeRecord(
	v?: Record<string, unknown>,
): Record<string, string> | undefined {
	if (typeof v !== "object" || !v) {
		return undefined;
	}
	const raw: Record<string, string> = {};
	for (const [key, value] of Object.entries(v)) {
		raw[key.toLowerCase().replaceAll("-", "").replaceAll("_", "")] =
			Array.isArray(value) ? value.map(String).join("; ") : String(value);
	}
	return raw;
}

export function parseSong(v?: Record<string, unknown>): Song | undefined {
	const song = create(SongSchema);

	const raw = normalizeRecord(v);
	if (raw === undefined) {
		return undefined;
	}

	if (raw.file) {
		song.path = raw.file;
	} else {
		return undefined;
	}

	const title = raw.title ? raw.title : "";
	song.metadata[Song_MetadataTag.TITLE] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: title }),
		},
	});

	const artist = raw.artist ? raw.artist : "";
	song.metadata[Song_MetadataTag.ARTIST] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: artist }),
		},
	});

	const albumArtist = raw.albumartist ? raw.albumartist : "";
	song.metadata[Song_MetadataTag.ALBUM_ARTIST] = create(
		Song_MetadataValueSchema,
		{
			value: {
				case: "stringValue",
				value: create(StringValueSchema, { value: albumArtist }),
			},
		},
	);

	const album = raw.album ? raw.album : "";
	song.metadata[Song_MetadataTag.ALBUM] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: album }),
		},
	});

	const genre = raw.genre ? raw.genre : "";
	song.metadata[Song_MetadataTag.GENRE] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: genre }),
		},
	});

	const composer = raw.composer ? raw.composer : "";
	song.metadata[Song_MetadataTag.COMPOSER] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: composer }),
		},
	});

	const track = raw.track && !Number.isNaN(+raw.track) ? +raw.track : undefined;
	song.metadata[Song_MetadataTag.TRACK] = create(Song_MetadataValueSchema, {
		value: {
			case: "intValue",
			value: create(Int32ValueSchema, { value: track }),
		},
	});

	const disc = raw.disc && !Number.isNaN(+raw.disc) ? +raw.disc : undefined;
	song.metadata[Song_MetadataTag.DISC] = create(Song_MetadataValueSchema, {
		value: {
			case: "intValue",
			value: create(Int32ValueSchema, { value: disc }),
		},
	});

	const date = raw.date ? raw.date : "";
	song.metadata[Song_MetadataTag.DATE] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: date }),
		},
	});

	const duration =
		raw.duration && !Number.isNaN(+raw.duration) ? +raw.duration : undefined;
	song.metadata[Song_MetadataTag.DURATION] = create(Song_MetadataValueSchema, {
		value: {
			case: "floatValue",
			value: create(FloatValueSchema, { value: duration }),
		},
	});

	const format = raw.format ? parseAudioFormat(raw.format) : undefined;
	song.metadata[Song_MetadataTag.FORMAT] = create(Song_MetadataValueSchema, {
		value: {
			case: "format",
			value: format !== undefined ? format : create(AudioFormatSchema),
		},
	});

	const lastModified = raw.lastmodified ? raw.lastmodified : undefined;
	try {
		const updatedAt = dayjs(lastModified);
		song.metadata[Song_MetadataTag.UPDATED_AT] = create(
			Song_MetadataValueSchema,
			{
				value: {
					case: "timestamp",
					value: timestampFromDate(updatedAt.toDate()),
				},
			},
		);
	} catch (_) {
		song.metadata[Song_MetadataTag.UPDATED_AT] = create(
			Song_MetadataValueSchema,
			{
				value: {
					case: "timestamp",
					value: create(TimestampSchema, undefined),
				},
			},
		);
	}

	const id = raw.id && !Number.isNaN(+raw.id) ? +raw.id : undefined;
	song.metadata[Song_MetadataTag.ID] = create(Song_MetadataValueSchema, {
		value: {
			case: "intValue",
			value: create(Int32ValueSchema, { value: id }),
		},
	});

	const position = raw.pos && !Number.isNaN(+raw.pos) ? +raw.pos : undefined;
	song.metadata[Song_MetadataTag.POSITION] = create(Song_MetadataValueSchema, {
		value: {
			case: "intValue",
			value: create(Int32ValueSchema, { value: position }),
		},
	});

	const comment = raw.comment ? raw.comment : "";
	song.metadata[Song_MetadataTag.COMMENT] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: comment }),
		},
	});

	const label = raw.label ? raw.label : "";
	song.metadata[Song_MetadataTag.LABEL] = create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: label }),
		},
	});

	return song;
}

function parseAudioFormat(v: string): AudioFormat | undefined {
	const elems = v.split(":");
	if (elems.length === 0) {
		return undefined;
	}
	const format = create(AudioFormatSchema);
	if (elems[0].includes("dsd")) {
		format.encoding = AudioFormat_Encoding.DSD;
		const sr = elems[0].replace("dsd", "");
		if (!Number.isNaN(+sr)) {
			format.samplingRate = +sr;
		}
		if (elems.length > 1) {
			if (!Number.isNaN(+elems[1])) {
				format.channels = +elems[1];
			}
		}
	} else {
		format.encoding = AudioFormat_Encoding.PCM;
		if (!Number.isNaN(+elems[0])) {
			format.samplingRate = +elems[0];
		}
		if (elems.length > 1 && !Number.isNaN(+elems[1])) {
			format.bits = +elems[1];
		}
		if (elems.length > 2 && !Number.isNaN(+elems[2])) {
			format.channels = +elems[2];
		}
	}

	return format;
}

export function parseMpdStats(
	version: string,
	stats?: Record<string, unknown>,
): MpdStats | undefined {
	const mpdStats = create(MpdStatsSchema);

	const raw = normalizeRecord(stats);

	if (raw === undefined) {
		return undefined;
	}

	mpdStats.version = version;

	const artistsCount =
		raw.artists && !Number.isNaN(+raw.artists) ? +raw.artists : 0;
	mpdStats.artistsCount = artistsCount;

	const albumsCount =
		raw.albums && !Number.isNaN(+raw.albums) ? +raw.albums : 0;
	mpdStats.albumsCount = albumsCount;

	const songsCount = raw.songs && !Number.isNaN(+raw.songs) ? +raw.songs : 0;
	mpdStats.songsCount = songsCount;

	const uptime = raw.uptime && !Number.isNaN(+raw.uptime) ? +raw.uptime : 0;
	mpdStats.uptime = uptime;

	const playtime =
		raw.playtime && !Number.isNaN(+raw.playtime) ? +raw.playtime : 0;
	mpdStats.playtime = playtime;

	const totalPlaytime =
		raw.dbplaytime && !Number.isNaN(+raw.dbplaytime) ? +raw.dbplaytime : 0;
	mpdStats.totalPlaytime = totalPlaytime;

	const lastUpdated =
		raw.dbupdate && !Number.isNaN(+raw.dbupdate) ? +raw.dbupdate : 0;
	mpdStats.lastUpdated = timestampFromDate(new Date(lastUpdated * 1000));

	return mpdStats;
}

export function parseMpdOutputDevice(
	v?: Record<string, unknown>,
): MpdOutputDevice | undefined {
	const mpdOutput = create(MpdOutputDeviceSchema);

	const raw = normalizeRecord(v);

	if (raw === undefined) {
		return undefined;
	}

	const outputId =
		raw.outputid && !Number.isNaN(+raw.outputid) ? +raw.outputid : -1;
	mpdOutput.id = outputId;

	const outputName = raw.outputname ? raw.outputname : "";
	mpdOutput.name = outputName;

	const plugin = raw.plugin ? raw.plugin : "";
	mpdOutput.plugin = plugin;

	const isEnabled =
		raw.outputenabled && !Number.isNaN(+raw.outputenabled)
			? +raw.outputenabled
			: 0;
	mpdOutput.isEnabled = isEnabled === 1;

	return mpdOutput;
}

export function parsePlaylist(
	v?: Record<string, unknown>,
): Playlist | undefined {
	const playlist = create(PlaylistSchema);

	const raw = normalizeRecord(v);

	if (raw === undefined) {
		return undefined;
	}

	const name = raw.playlist ? raw.playlist : "";
	if (name === "") {
		return undefined;
	}
	playlist.name = name;

	const lastModified = raw.lastmodified ? raw.lastmodified : undefined;
	try {
		const updatedAt = dayjs(lastModified);
		playlist.updatedAt = timestampFromDate(updatedAt.toDate());
	} catch (e) {
		console.error(`Failed to parse last-modified: ${e}`);
	}

	return playlist;
}

export function parseFolder(v?: Record<string, unknown>): Folder | undefined {
	const folder = create(FolderSchema);

	const raw = normalizeRecord(v);

	if (raw === undefined) {
		return undefined;
	}

	const path = raw.directory ? raw.directory : "";
	if (path === "") {
		return undefined;
	}
	folder.path = path;
	return folder;
}

export function parseMpdPlayerVolume(
	v?: Record<string, unknown>,
): MpdPlayerVolume | undefined {
	const mpdVolume = create(MpdPlayerVolumeSchema);

	const raw = normalizeRecord(v);

	if (raw === undefined) {
		mpdVolume.volume = -1;
		return mpdVolume;
	}

	const vol = raw.volume && !Number.isNaN(+raw.volume) ? +raw.volume : -1;
	mpdVolume.volume = vol;

	return mpdVolume;
}

export function parseMpdPlayerStatus(
	v?: Record<string, unknown>,
): MpdPlayerStatus | undefined {
	const mpdStatus = create(MpdPlayerStatusSchema);

	const raw = normalizeRecord(v);
	if (raw === undefined) {
		return undefined;
	}

	const isRepeat = raw.repeat && !Number.isNaN(+raw.repeat) ? +raw.repeat : 0;
	mpdStatus.isRepeat = isRepeat === 1;

	const isRandom = raw.random && !Number.isNaN(+raw.random) ? +raw.random : 0;
	mpdStatus.isRandom = isRandom === 1;

	const isSingle = raw.single && !Number.isNaN(+raw.single) ? +raw.single : 0;
	mpdStatus.isSingle = isSingle === 1;

	const isConsume =
		raw.consume && !Number.isNaN(+raw.consume) ? +raw.consume : 0;
	mpdStatus.isConsume = isConsume === 1;

	const playQueueLength =
		raw.playlistlength && !Number.isNaN(+raw.playlistlength)
			? +raw.playlistlength
			: -1;
	mpdStatus.playQueueLength = playQueueLength;

	const state = raw.state ? raw.state : "";
	switch (state) {
		case "play":
			mpdStatus.playbackState = MpdPlayerStatus_PlaybackState.PLAY;
			break;
		case "pause":
			mpdStatus.playbackState = MpdPlayerStatus_PlaybackState.PAUSE;
			break;
		case "stop":
			mpdStatus.playbackState = MpdPlayerStatus_PlaybackState.STOP;
			break;
		default:
			mpdStatus.playbackState = MpdPlayerStatus_PlaybackState.UNKNOWN;
	}

	const song = raw.song && !Number.isNaN(+raw.song) ? +raw.song : -1;
	mpdStatus.song = song;

	const songId = raw.songid && !Number.isNaN(+raw.songid) ? +raw.songid : -1;
	mpdStatus.songId = songId;

	const nextSong =
		raw.nextsong && !Number.isNaN(+raw.nextsong) ? +raw.nextsong : -1;
	mpdStatus.nextSong = nextSong;

	const nextSongId =
		raw.nextsongid && !Number.isNaN(+raw.nextsongid) ? +raw.nextsongid : -1;
	mpdStatus.nextSongId = nextSongId;

	const elapsed = raw.elapsed && !Number.isNaN(+raw.elapsed) ? +raw.elapsed : 0;
	mpdStatus.elapsed = elapsed;

	const duration =
		raw.duration && !Number.isNaN(+raw.duration) ? +raw.duration : 0;
	mpdStatus.duration = duration;

	const bitrate = raw.bitrate && !Number.isNaN(+raw.bitrate) ? +raw.bitrate : 0;
	mpdStatus.bitrate = bitrate;

	const format = raw.audio ? raw.audio : "";
	mpdStatus.audioFormat = parseAudioFormat(format);

	const isUpdating =
		raw.updatingdb && !Number.isNaN(+raw.updatingdb) ? +raw.updatingdb : -1;
	mpdStatus.isDatabaseUpdating = isUpdating >= 0;

	return mpdStatus;
}
