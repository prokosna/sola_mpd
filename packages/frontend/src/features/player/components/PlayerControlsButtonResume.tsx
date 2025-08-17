import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { MpdPlayerStatus_PlaybackState } from "@sola_mpd/domain/src/models/mpd/mpd_player_pb.js";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { useCallback } from "react";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";
import { usePlayerStatusPlaybackState } from "../states/playerStatusState";
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
	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const currentSong = useCurrentSongState();
	const playerStatusPlaybackState = usePlayerStatusPlaybackState();

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}

		mpdClient.command(
			create(MpdRequestSchema, {
				profile,
				command: {
					case: "pause",
					value: {
						pause:
							playerStatusPlaybackState === MpdPlayerStatus_PlaybackState.PLAY,
					},
				},
			}),
		);
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
