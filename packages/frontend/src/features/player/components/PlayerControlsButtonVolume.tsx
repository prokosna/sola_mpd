import {
	Center,
	IconButton,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	Tooltip,
} from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoVolumeMute } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useIsCompactMode } from "../../user_device";
import { usePlayerVolumeState } from "../states/playerVolumeState";

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
	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const playerVolume = usePlayerVolumeState();
	const isCompact = useIsCompactMode();

	const volume = playerVolume?.volume !== undefined ? playerVolume.volume : -1;

	const onVolumeChanged = useCallback(
		async (volume: number) => {
			if (profile === undefined || mpdClient === undefined) {
				return;
			}

			if (volume < 0 || volume > 100) {
				return;
			}

			mpdClient.command(
				new MpdRequest({
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
			<Tooltip
				label={volume < 0 ? "Volume disabled" : volume}
				placement={isCompact ? "top" : "left-start"}
			>
				{volume < 0 ? (
					<IconButton
						isDisabled={true}
						variant={"ghost"}
						colorScheme="brand"
						aria-label="Volume disabled"
						size={"md"}
						icon={<IoVolumeMute size={"24"} />}
						m={1}
					/>
				) : (
					<Center h="100%">
						<Slider
							ml={3}
							aria-label="Volume"
							defaultValue={30}
							min={0}
							max={100}
							orientation="vertical"
							h="60%"
							onChangeEnd={(v) => onVolumeChanged(v)}
						>
							<SliderTrack>
								<SliderFilledTrack />
							</SliderTrack>
							<SliderThumb />
						</Slider>
					</Center>
				)}
			</Tooltip>
		</>
	);
}
