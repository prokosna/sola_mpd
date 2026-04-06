import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import { buildPauseCommand } from "../functions/playerCommand";
import { currentSongAtom } from "../states/atoms/currentSongAtom";
import { playerStatusPlaybackStateAtom } from "../states/atoms/playerStatusAtom";
import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Button for toggling play/pause state.
 *
 * Controls playback of the current track, switching between
 * play and pause states. Updates icon and label based on
 * current playback status.
 *
 * @returns Play/pause toggle button
 */
export function PlayerControlsButtonResume() {
	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);
	const currentSong = useAtomValue(currentSongAtom);
	const playerStatusPlaybackState = useAtomValue(playerStatusPlaybackStateAtom);

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}
		const pause =
			playerStatusPlaybackState === MpdPlayerStatus_PlaybackState.PLAY;
		mpdClient.command(buildPauseCommand(profile, pause));
	}, [mpdClient, playerStatusPlaybackState, profile]);

	const props = {
		label:
			playerStatusPlaybackState === MpdPlayerStatus_PlaybackState.PLAY
				? "Pause"
				: "Resume",
		isDisabled: currentSong === undefined,
		onButtonClicked,
		icon:
			playerStatusPlaybackState === MpdPlayerStatus_PlaybackState.PLAY ? (
				<IconPlayerPause size={"24"} />
			) : (
				<IconPlayerPlay size={"24"} />
			),
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
