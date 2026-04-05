import { create } from "@bufbuild/protobuf";
import {
	ActionIcon,
	Box,
	Slider,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { IconVolumeOff } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import { useIsCompactMode } from "../../user_device";
import { playerVolumeAtom } from "../states/atoms/playerVolumeAtom";

/**
 * Volume control component with button and slider.
 *
 * Provides volume adjustment and mute/unmute functionality.
 * Adapts layout based on compact mode setting and updates
 * appearance based on current volume level.
 *
 * @returns Volume control component
 */
export function PlayerControlsButtonVolume() {
	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);
	const playerVolume = useAtomValue(playerVolumeAtom);
	const isCompact = useIsCompactMode();

	const volume = playerVolume?.volume !== undefined ? playerVolume.volume : -1;

	const theme = useMantineTheme();

	const onVolumeChanged = useCallback(
		async (volume: number) => {
			if (profile === undefined || mpdClient === undefined) {
				return;
			}

			if (volume < 0 || volume > 100) {
				return;
			}

			mpdClient.command(
				create(MpdRequestSchema, {
					profile,
					command: {
						case: "setvol",
						value: {
							vol: volume,
						},
					},
				}),
			);
		},
		[mpdClient, profile],
	);

	return (
		<>
			{volume < 0 ? (
				<Tooltip
					label={"Volume disabled"}
					position={isCompact ? "top" : "left-start"}
				>
					<ActionIcon disabled={true} variant="transparent" m={2}>
						<IconVolumeOff size={"24"} />
					</ActionIcon>
				</Tooltip>
			) : (
				<Box w={90} m={2}>
					<Slider
						color={theme.primaryColor}
						defaultValue={playerVolume?.volume}
						min={0}
						max={100}
						onChangeEnd={(v) => onVolumeChanged(v)}
					/>
				</Box>
			)}
		</>
	);
}
