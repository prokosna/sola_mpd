import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { IconPlayerSkipBack } from "@tabler/icons-react";
import { useCallback } from "react";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";
import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Button for playing the previous track.
 *
 * Sends the 'previous' command to MPD when clicked. Disabled
 * when no song is currently playing.
 *
 * @returns Previous track button
 */
export function PlayerControlsButtonPrevious() {
	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const currentSong = useCurrentSongState();

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}

		mpdClient.command(
			new MpdRequest({
				profile,
				command: {
					case: "previous",
					value: {},
				},
			}),
		);
	}, [mpdClient, profile]);

	const props = {
		label: "Play previous",
		isDisabled: currentSong === undefined,
		onButtonClicked,
		icon: <IconPlayerSkipBack size={"24"} />,
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
