import { create } from "@bufbuild/protobuf";
import {
	MpdPlayerStatus_PlaybackState,
	MpdPlayerStatusSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import { describe, expect, it } from "vitest";

import {
	interpolateElapsed,
	isPlaybackAdvancing,
	type PlayerStatusSnapshot,
} from "./playerElapsed";

function snapshot(
	fields: {
		playbackState: MpdPlayerStatus_PlaybackState;
		elapsed?: number;
		duration?: number;
	},
	receivedAt = 1_000,
): PlayerStatusSnapshot {
	return { status: create(MpdPlayerStatusSchema, fields), receivedAt };
}

describe("playerElapsed", () => {
	describe("isPlaybackAdvancing", () => {
		it("should be true only while playing", () => {
			expect(isPlaybackAdvancing(MpdPlayerStatus_PlaybackState.PLAY)).toBe(
				true,
			);
			expect(isPlaybackAdvancing(MpdPlayerStatus_PlaybackState.PAUSE)).toBe(
				false,
			);
			expect(isPlaybackAdvancing(MpdPlayerStatus_PlaybackState.STOP)).toBe(
				false,
			);
			expect(isPlaybackAdvancing(MpdPlayerStatus_PlaybackState.UNKNOWN)).toBe(
				false,
			);
			expect(isPlaybackAdvancing(undefined)).toBe(false);
		});
	});

	describe("interpolateElapsed", () => {
		it("should return undefined without a snapshot", () => {
			expect(interpolateElapsed(undefined, 5_000)).toBeUndefined();
		});

		it("should return undefined when MPD reports no elapsed", () => {
			const s = snapshot({ playbackState: MpdPlayerStatus_PlaybackState.STOP });
			expect(interpolateElapsed(s, 5_000)).toBeUndefined();
		});

		it("should advance elapsed by the time since the snapshot while playing", () => {
			const s = snapshot({
				playbackState: MpdPlayerStatus_PlaybackState.PLAY,
				elapsed: 10,
				duration: 200,
			});
			expect(interpolateElapsed(s, 1_000)).toBe(10);
			expect(interpolateElapsed(s, 3_500)).toBe(12.5);
		});

		it("should not advance while paused", () => {
			const s = snapshot({
				playbackState: MpdPlayerStatus_PlaybackState.PAUSE,
				elapsed: 42,
				duration: 200,
			});
			expect(interpolateElapsed(s, 60_000)).toBe(42);
		});

		it("should keep the reported elapsed when stopped", () => {
			const s = snapshot({
				playbackState: MpdPlayerStatus_PlaybackState.STOP,
				elapsed: 0,
			});
			expect(interpolateElapsed(s, 60_000)).toBe(0);
		});

		it("should not go backwards when the clock predates the snapshot", () => {
			const s = snapshot(
				{
					playbackState: MpdPlayerStatus_PlaybackState.PLAY,
					elapsed: 30,
					duration: 200,
				},
				10_000,
			);
			expect(interpolateElapsed(s, 9_500)).toBe(30);
		});

		it("should clamp to the duration", () => {
			const s = snapshot({
				playbackState: MpdPlayerStatus_PlaybackState.PLAY,
				elapsed: 198,
				duration: 200,
			});
			expect(interpolateElapsed(s, 11_000)).toBe(200);
		});

		it("should not clamp streams without a duration", () => {
			const noDuration = snapshot({
				playbackState: MpdPlayerStatus_PlaybackState.PLAY,
				elapsed: 100,
			});
			const zeroDuration = snapshot({
				playbackState: MpdPlayerStatus_PlaybackState.PLAY,
				elapsed: 100,
				duration: 0,
			});
			expect(interpolateElapsed(noDuration, 11_000)).toBe(110);
			expect(interpolateElapsed(zeroDuration, 11_000)).toBe(110);
		});

		it("should restart from the new snapshot after a seek", () => {
			const beforeSeek = snapshot({
				playbackState: MpdPlayerStatus_PlaybackState.PLAY,
				elapsed: 10,
				duration: 200,
			});
			const afterSeek = snapshot(
				{
					playbackState: MpdPlayerStatus_PlaybackState.PLAY,
					elapsed: 150,
					duration: 200,
				},
				5_000,
			);
			expect(interpolateElapsed(beforeSeek, 5_000)).toBe(14);
			expect(interpolateElapsed(afterSeek, 6_000)).toBe(151);
		});
	});
});
