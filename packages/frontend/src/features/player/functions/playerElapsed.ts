import {
	type MpdPlayerStatus,
	MpdPlayerStatus_PlaybackState,
} from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";

export type PlayerStatusSnapshot = {
	status: MpdPlayerStatus;
	// Monotonic milliseconds (performance.now()) when the status was received.
	receivedAt: number;
};

export function isPlaybackAdvancing(
	playbackState: MpdPlayerStatus_PlaybackState | undefined,
): boolean {
	return playbackState === MpdPlayerStatus_PlaybackState.PLAY;
}

export function interpolateElapsed(
	snapshot: PlayerStatusSnapshot | undefined,
	now: number,
): number | undefined {
	if (snapshot === undefined) {
		return undefined;
	}
	const { elapsed, duration, playbackState } = snapshot.status;
	if (elapsed === undefined) {
		return undefined;
	}
	if (!isPlaybackAdvancing(playbackState)) {
		return elapsed;
	}

	const advanced = elapsed + Math.max(0, now - snapshot.receivedAt) / 1000;
	// Streams report no duration (or 0), so they must not be clamped.
	if (duration === undefined || duration <= 0) {
		return advanced;
	}
	return Math.min(advanced, duration);
}
