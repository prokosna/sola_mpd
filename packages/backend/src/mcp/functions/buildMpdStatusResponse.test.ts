import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	MpdPlayerStatus_PlaybackState,
	MpdPlayerStatusSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import { buildMpdStatusResponse } from "./buildMpdStatusResponse.js";

describe("buildMpdStatusResponse", () => {
	it("returns the default payload when status and song are undefined", () => {
		expect(buildMpdStatusResponse(undefined, undefined)).toEqual({
			playback_state: "UNKNOWN",
			queue_length: 0,
			song_position: -1,
			song_id: -1,
			next_song_position: -1,
			elapsed_seconds: null,
			duration_seconds: null,
			bitrate_kbps: null,
			is_repeat: false,
			is_random: false,
			is_single: false,
			is_consume: false,
			is_database_updating: false,
			current_song: undefined,
		});
	});

	it("maps PlaybackState enum to its string name", () => {
		const status = create(MpdPlayerStatusSchema, {
			playbackState: MpdPlayerStatus_PlaybackState.PLAY,
		});
		expect(buildMpdStatusResponse(status, undefined).playback_state).toBe(
			"PLAY",
		);
	});

	it("forwards numeric and boolean status fields", () => {
		const status = create(MpdPlayerStatusSchema, {
			playbackState: MpdPlayerStatus_PlaybackState.PAUSE,
			playQueueLength: 12,
			song: 3,
			songId: 99,
			nextSong: 4,
			elapsed: 42.5,
			duration: 180,
			bitrate: 320,
			isRepeat: true,
			isRandom: false,
			isSingle: true,
			isConsume: false,
			isDatabaseUpdating: true,
		});
		expect(buildMpdStatusResponse(status, undefined)).toMatchObject({
			playback_state: "PAUSE",
			queue_length: 12,
			song_position: 3,
			song_id: 99,
			next_song_position: 4,
			elapsed_seconds: 42.5,
			duration_seconds: 180,
			bitrate_kbps: 320,
			is_repeat: true,
			is_random: false,
			is_single: true,
			is_consume: false,
			is_database_updating: true,
		});
	});

	it("embeds the current song output when provided", () => {
		const currentSong = create(SongSchema, {
			path: "music/track.flac",
			metadata: {
				[Song_MetadataTag.TITLE]: create(Song_MetadataValueSchema, {
					value: {
						case: "stringValue",
						value: create(StringValueSchema, { value: "My Song" }),
					},
				}),
			},
		});
		const result = buildMpdStatusResponse(undefined, currentSong);
		expect(result.current_song).toBeDefined();
		expect(result.current_song?.path).toBe("music/track.flac");
		expect(result.current_song?.title).toBe("My Song");
	});
});
