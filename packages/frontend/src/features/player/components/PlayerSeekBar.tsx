import { Slider } from "@mantine/core";
import { displayDuration } from "@sola_mpd/shared/src/utils/stringUtils.js";
import { useAtomValue, useSetAtom } from "jotai";
import {
	getElapsedFromPercentage,
	getElapsedTimePercentage,
	isSeekable,
} from "../functions/playerDisplay";
import { usePlayerSeekBarSlider } from "../hooks/usePlayerSeekBarSlider";
import { seekActionAtom } from "../states/actions/seekActionAtom";
import {
	playerStatusDurationAtom,
	playerStatusElapsedAtom,
	playerStatusReceivedAtAtom,
} from "../states/atoms/playerStatusAtom";

export function PlayerSeekBar() {
	const playerStatusElapsed = useAtomValue(playerStatusElapsedAtom);
	const playerStatusDuration = useAtomValue(playerStatusDurationAtom);
	const playerStatusReceivedAt = useAtomValue(playerStatusReceivedAtAtom);
	const seek = useSetAtom(seekActionAtom);

	const seekable = isSeekable(playerStatusDuration);
	const slider = usePlayerSeekBarSlider(
		getElapsedTimePercentage(playerStatusElapsed, playerStatusDuration),
		playerStatusReceivedAt,
		seekable,
		seek,
	);
	const labelElapsed =
		slider.draftPercentage !== undefined
			? getElapsedFromPercentage(slider.draftPercentage, playerStatusDuration)
			: playerStatusElapsed;

	return (
		<Slider
			w="100%"
			mt={-4}
			min={0}
			max={100}
			thumbSize={0}
			disabled={!seekable}
			value={slider.value}
			label={displayDuration(labelElapsed ?? 0)}
			onChange={slider.onChange}
			onChangeEnd={slider.onChangeEnd}
			styles={{
				// Lift above sibling absolute groups (PlayerDuration / controls)
				// that would otherwise intercept clicks below the visible bar.
				root: { zIndex: 1 },
			}}
		/>
	);
}
