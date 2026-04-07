import { IconPlayerStop } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { stopActionAtom } from "../states/actions/stopActionAtom";
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
	const currentSong = useAtomValue(currentSongAtom);
	const stop = useSetAtom(stopActionAtom);

	const onButtonClicked = useCallback(() => {
		stop();
	}, [stop]);

	const props = {
		label: "Stop",
		isDisabled: currentSong === undefined,
		onButtonClicked,
		icon: <IconPlayerStop size={"24"} />,
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
