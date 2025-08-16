import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";

import { IconPlayerSkipForward } from "@tabler/icons-react";
import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Button for playing the next track.
 *
 * Sends the 'next' command to MPD when clicked. Disabled when
 * no song is currently playing.
 *
 * @returns Next track button
 */
export function PlayerControlsButtonNext() {
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
					case: "next",
					value: {},
				},
			}),
		);
	}, [mpdClient, profile]);

	const props = {
		label: "Play next",
		isDisabled: currentSong === undefined,
		onButtonClicked,
		icon: <IconPlayerSkipForward size={"24"} />,
		variant: "transparent",
	};

	return (
		<>
			<PlayerControlsButton {...props} />
		</>
	);
}
