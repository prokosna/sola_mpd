import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { IconPlayerStop } from "@tabler/icons-react";
import { useCallback } from "react";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";
import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Button for stopping playback.
 *
 * Sends the 'stop' command to MPD when clicked. Disabled
 * when no song is currently playing.
 *
 * @returns Stop button
 */
export function PlayerControlsButtonStop() {
	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const currentSong = useCurrentSongState();

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}

		mpdClient.command(
			create(MpdRequestSchema, {
				profile,
				command: {
					case: "stop",
					value: {},
				},
			}),
		);
	}, [mpdClient, profile]);

	const props = {
		label: "Stop",
		isDisabled: currentSong === undefined,
		onButtonClicked,
		icon: <IconPlayerStop size={"24"} />,
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
