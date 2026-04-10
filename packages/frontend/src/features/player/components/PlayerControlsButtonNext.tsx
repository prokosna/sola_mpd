import { IconPlayerSkipForward } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { nextActionAtom } from "../states/actions/nextActionAtom";
import { currentSongAtom } from "../states/atoms/currentSongAtom";
import { PlayerControlsButton } from "./PlayerControlsButton";

export function PlayerControlsButtonNext() {
	const currentSong = useAtomValue(currentSongAtom);
	const next = useSetAtom(nextActionAtom);

	const onButtonClicked = useCallback(() => {
		next();
	}, [next]);

	const props = {
		label: "Play next",
		isDisabled: currentSong === undefined,
		onButtonClicked,
		icon: <IconPlayerSkipForward size={"24"} />,
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
