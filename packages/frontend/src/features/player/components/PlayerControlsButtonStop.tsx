import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { IconPlayerStop } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import { currentSongAtom } from "../states/atoms/currentSongAtom";
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
