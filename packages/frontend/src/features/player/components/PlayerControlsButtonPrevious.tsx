import { IconPlayerSkipBack } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { previousActionAtom } from "../states/actions/previousActionAtom";
import { currentSongAtom } from "../states/atoms/currentSongAtom";
import { PlayerControlsButton } from "./PlayerControlsButton";

export function PlayerControlsButtonPrevious() {
	const currentSong = useAtomValue(currentSongAtom);
	const previous = useSetAtom(previousActionAtom);

	const onButtonClicked = useCallback(async () => {
		previous();
	}, [previous]);

	const props = {
		label: "Play previous",
		isDisabled: currentSong === undefined,
		onButtonClicked,
		icon: <IconPlayerSkipBack size={"24"} />,
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
