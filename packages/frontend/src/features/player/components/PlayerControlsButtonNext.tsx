import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { IconPlayerSkipForward } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import { currentSongAtom } from "../states/atoms/currentSongAtom";
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
	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);
	const currentSong = useAtomValue(currentSongAtom);

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}

		mpdClient.command(
			create(MpdRequestSchema, {
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

	return <PlayerControlsButton {...props} />;
}
