import { IconPlayerSkipBack } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import { buildPreviousCommand } from "../functions/playerCommand";
import { currentSongAtom } from "../states/atoms/currentSongAtom";
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
	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);
	const currentSong = useAtomValue(currentSongAtom);

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}
		mpdClient.command(buildPreviousCommand(profile));
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
