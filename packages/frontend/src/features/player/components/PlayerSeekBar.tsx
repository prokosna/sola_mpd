import { create } from "@bufbuild/protobuf";
import { Slider } from "@mantine/core";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { displayDuration } from "@sola_mpd/shared/src/utils/stringUtils.js";
import { useAtomValue } from "jotai";
import { useCallback, useRef } from "react";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import {
	playerStatusDurationAtom,
	playerStatusElapsedAtom,
} from "../states/atoms/playerStatusAtom";
import { getElapsedTimePercentage } from "../utils/playerDisplayUtils";

/**
 * Seek bar for track navigation.
 *
 * Displays playback progress and allows position changes via
 * slider interaction. Throttles seek commands to prevent
 * overwhelming the MPD server.
 *
 * @returns Seek bar slider component
 */
export function PlayerSeekBar() {
	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);
	const playerStatusElapsed = useAtomValue(playerStatusElapsedAtom);
	const playerStatusDuration = useAtomValue(playerStatusDurationAtom);

	const elapsedTimePercentage = getElapsedTimePercentage(
		playerStatusElapsed,
		playerStatusDuration,
	);

	const lastSeekClicked = useRef(new Date());
	const handleSeekBarClick = useCallback(
		async (value: number) => {
			if (profile === undefined || mpdClient === undefined) {
				return;
			}

			if (value < 0 || value > 100) {
				return;
			}

			if (playerStatusDuration === undefined) {
				return;
			}

			// It is possible that onChange() is fired frequently.
			const now = new Date();
			const last = lastSeekClicked.current;
			const elapsed = now.getTime() - last.getTime();
			if (elapsed < 1000) {
				return;
			}
			lastSeekClicked.current = now;

			const seekTo = (value / 100) * playerStatusDuration;
			mpdClient.command(
				create(MpdRequestSchema, {
					profile,
					command: {
						case: "seek",
						value: {
							target: {
								case: "current",
								value: true,
							},
							time: seekTo,
						},
					},
				}),
			);
		},
		[mpdClient, playerStatusDuration, profile],
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
