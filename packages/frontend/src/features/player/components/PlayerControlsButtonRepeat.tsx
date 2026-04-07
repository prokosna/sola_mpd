import { IconRepeat, IconRepeatOff } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { toggleRepeatActionAtom } from "../states/actions/toggleRepeatActionAtom";
import { playerStatusIsRepeatAtom } from "../states/atoms/playerStatusAtom";
import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Button for toggling repeat mode.
 *
 * Controls whether the playlist repeats after reaching the end.
 * Updates button state based on current repeat mode status.
 *
 * @returns Repeat mode toggle button
 */
export function PlayerControlsButtonRepeat() {
	const playerStatusIsRepeat = useAtomValue(playerStatusIsRepeatAtom);
	const toggleRepeat = useSetAtom(toggleRepeatActionAtom);

	const onButtonClicked = useCallback(() => {
		toggleRepeat();
	}, [toggleRepeat]);

	const props = {
		label: playerStatusIsRepeat ? "Repeat enabled" : "Repeat disabled",
		isDisabled: false,
		onButtonClicked,
		icon: playerStatusIsRepeat ? (
			<IconRepeat size={"24"} />
		) : (
			<IconRepeatOff size={"24"} />
		),
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
