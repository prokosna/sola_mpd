import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";
import { IoRestaurantOutline } from "react-icons/io5";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { useCurrentSongState } from "../states/playerSongState";
import { usePlayerStatusIsConsumeState } from "../states/playerStatusState";

import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Button for toggling MPD's consume mode.
 *
 * Controls whether played songs are automatically removed from
 * the playlist. Updates button state based on current consume
 * mode status.
 *
 * @returns Consume mode toggle button
 */
export function PlayerControlsButtonConsume() {
	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const currentSong = useCurrentSongState();
	const playerStatusIsConsume = usePlayerStatusIsConsumeState();

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}
		mpdClient.command(
			new MpdRequest({
				profile,
				command: {
					case: "consume",
					value: {
						enable: !playerStatusIsConsume,
					},
				},
			}),
		);
	}, [mpdClient, playerStatusIsConsume, profile]);

	const props = {
		label: playerStatusIsConsume ? "Consume enabled" : "Consume disabled",
		isDisabled: currentSong === undefined,
		onButtonClicked,
		icon: <IoRestaurantOutline size={"24"} />,
		variant: playerStatusIsConsume ? "solid" : "ghost",
	};

	return (
		<>
			<PlayerControlsButton {...props} />
		</>
	);
}
