import { IconArrowsRight, IconArrowsShuffle } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import { buildRandomCommand } from "../functions/playerCommand";
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
	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);
	const playerStatusIsRandom = useAtomValue(playerStatusIsRandomAtom);

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}
		mpdClient.command(buildRandomCommand(profile, !playerStatusIsRandom));
	}, [mpdClient, playerStatusIsRandom, profile]);

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
