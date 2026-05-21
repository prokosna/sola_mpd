import type { MpdPlayerStatus } from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import { type SongOutput, songToOutput } from "./songToOutput.js";

export type MpdStatusResponse = {
	playback_state: string | undefined;
	queue_length: number;
	song_position: number;
	song_id: number;
	next_song_position: number;
	elapsed_seconds: number | null;
	duration_seconds: number | null;
	bitrate_kbps: number | null;
	is_repeat: boolean;
	is_random: boolean;
	is_single: boolean;
	is_consume: boolean;
	is_database_updating: boolean;
	current_song: SongOutput | undefined;
};

const PLAYBACK_STATE_NAMES = ["UNKNOWN", "PLAY", "STOP", "PAUSE"] as const;

export function buildMpdStatusResponse(
	status: MpdPlayerStatus | undefined,
	currentSong: Song | undefined,
): MpdStatusResponse {
	return {
		playback_state:
			status?.playbackState !== undefined
				? PLAYBACK_STATE_NAMES[status.playbackState]
				: "UNKNOWN",
		queue_length: status?.playQueueLength ?? 0,
		song_position: status?.song ?? -1,
		song_id: status?.songId ?? -1,
		next_song_position: status?.nextSong ?? -1,
		elapsed_seconds: status?.elapsed ?? null,
		duration_seconds: status?.duration ?? null,
		bitrate_kbps: status?.bitrate ?? null,
		is_repeat: status?.isRepeat ?? false,
		is_random: status?.isRandom ?? false,
		is_single: status?.isSingle ?? false,
		is_consume: status?.isConsume ?? false,
		is_database_updating: status?.isDatabaseUpdating ?? false,
		current_song: currentSong ? songToOutput(currentSong) : undefined,
	};
}
