import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { IconEraser, IconEraserOff } from "@tabler/icons-react";
import { useCallback } from "react";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
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
		isDisabled: false,
		onButtonClicked,
		icon: playerStatusIsConsume ? (
			<IconEraser size="24" />
		) : (
			<IconEraserOff size="24" />
		),
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
