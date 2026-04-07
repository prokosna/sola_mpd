import { IconArrowsRight, IconArrowsShuffle } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { toggleRandomActionAtom } from "../states/actions/toggleRandomActionAtom";
import { playerStatusIsRandomAtom } from "../states/atoms/playerStatusAtom";
import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Button for toggling random playback mode.
 *
 * Controls whether songs are played in random order. Updates
 * button state based on current random mode status.
 *
 * @returns Random mode toggle button
 */
export function PlayerControlsButtonRandom() {
	const playerStatusIsRandom = useAtomValue(playerStatusIsRandomAtom);
	const toggleRandom = useSetAtom(toggleRandomActionAtom);

	const onButtonClicked = useCallback(() => {
		toggleRandom();
	}, [toggleRandom]);

	const props = {
		label: playerStatusIsRandom ? "Random enabled" : "Random disabled",
		isDisabled: false,
		onButtonClicked,
		icon: playerStatusIsRandom ? (
			<IconArrowsShuffle size="24" />
		) : (
			<IconArrowsRight size="24" />
		),
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
