import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import { useAtomValue } from "jotai";

import { mpdClientAtom } from "../../mpd";
import { playerStatusPlaybackStateAtom } from "../../player";
import { buildPauseCommand } from "../../player/functions/playerCommand";
import { currentMpdProfileAtom } from "../../profile";

import { useInputKeyCombination } from "./useInputKeyCombination";

/**
 * Global keyboard shortcut handler for media control.
 *
 * Features:
 * - Media playback control
 * - Context-aware actions
 * - Input element safety
 * - MPD command integration
 *
 * Supported Shortcuts:
 * - Space: Toggle playback
 *   - Stop → Play
 *   - Play → Pause
 *   - Pause → Play
 *
 * Implementation:
 * - Uses useInputKeyCombination for key handling
 * - Checks input element focus state
 * - Manages MPD client commands
 * - Handles connection state
 *
 * Safety Features:
 * - Ignores shortcuts when inputs focused
 * - Validates MPD client state
 * - Checks profile availability
 * - Handles all playback states
 *
 * Dependencies:
 * - MPD client connection
 * - Current MPD profile
 * - Player status state
 * - Input combination hook
 */
export function useGlobalKeyShortcuts(): void {
	const mpdClient = useAtomValue(mpdClientAtom);
	const profile = useAtomValue(currentMpdProfileAtom);
	const playerPlaybackState = useAtomValue(playerStatusPlaybackStateAtom);

	useInputKeyCombination(undefined, [" "], async () => {
		if (mpdClient === undefined || profile === undefined) {
			return;
		}
		switch (playerPlaybackState) {
			case MpdPlayerStatus_PlaybackState.STOP:
			case MpdPlayerStatus_PlaybackState.PAUSE:
				mpdClient.command(buildPauseCommand(profile, false));
				break;
			case MpdPlayerStatus_PlaybackState.PLAY:
				mpdClient.command(buildPauseCommand(profile, true));
				break;
			default:
				return;
		}
	});
}
