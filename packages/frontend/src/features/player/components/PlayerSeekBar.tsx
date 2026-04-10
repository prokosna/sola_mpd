import { Slider } from "@mantine/core";
import { displayDuration } from "@sola_mpd/shared/src/utils/stringUtils.js";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useRef } from "react";
import { getElapsedTimePercentage } from "../functions/playerDisplay";
import { seekActionAtom } from "../states/actions/seekActionAtom";
import {
	playerStatusDurationAtom,
	playerStatusElapsedAtom,
} from "../states/atoms/playerStatusAtom";

export function PlayerSeekBar() {
	const playerStatusElapsed = useAtomValue(playerStatusElapsedAtom);
	const playerStatusDuration = useAtomValue(playerStatusDurationAtom);
	const seek = useSetAtom(seekActionAtom);

	const elapsedTimePercentage = getElapsedTimePercentage(
		playerStatusElapsed,
		playerStatusDuration,
	);

	const lastSeekClicked = useRef(new Date());
	const handleSeekBarClick = useCallback(
		(value: number) => {
			// It is possible that onChange() is fired frequently.
			const now = new Date();
			const last = lastSeekClicked.current;
			const elapsed = now.getTime() - last.getTime();
			if (elapsed < 1000) {
				return;
			}
			lastSeekClicked.current = now;

			seek(value);
		},
		[seek],
	);

	return (
		<Slider
			w="100%"
			mt={-4}
			min={0}
			max={100}
			thumbSize={0}
			value={elapsedTimePercentage}
			label={displayDuration(playerStatusElapsed ?? 0)}
			onChangeEnd={(v) => {
				handleSeekBarClick(v);
			}}
		/>
	);
}
