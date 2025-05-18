import {
	Center,
	IconButton,
	Slider,
	type SliderValueChangeDetails,
} from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoVolumeMute } from "react-icons/io5";

import { Tooltip } from "../../../components/ui/tooltip";
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
		async (details: SliderValueChangeDetails) => {
			const newVolume = details.value[0];
			if (profile === undefined || mpdClient === undefined) {
				return;
			}

			if (newVolume < 0 || newVolume > 100) {
				return;
			}

			if (newVolume === volume) {
				return;
			}

			mpdClient.command(
				new MpdRequest({
					profile,
					command: {
						case: "setvol",
						value: {
							vol: newVolume,
						},
					},
				}),
			);
		},
		[mpdClient, profile, volume],
	);

	return (
		<>
			<Tooltip
				content={volume < 0 ? "Volume disabled" : volume}
				positioning={{ placement: isCompact ? "top" : "left-start" }}
			>
				{volume < 0 ? (
					<IconButton
						disabled={true}
						variant={"ghost"}
						colorScheme="brand"
						aria-label="Volume disabled"
						size={"md"}
						m={1}
					>
						<IoVolumeMute size={"24"} />
					</IconButton>
				) : (
					<Center h="100%">
						<Slider.Root
							ml={3}
							aria-label={["Volume"]}
							defaultValue={[volume]}
							min={0}
							max={100}
							orientation="vertical"
							h="60%"
							onValueChangeEnd={(v) => onVolumeChanged(v)}
						>
							<Slider.Track>
								<Slider.Range />
							</Slider.Track>
							<Slider.Thumbs />
						</Slider.Root>
					</Center>
				)}
			</Tooltip>
		</>
	);
}
