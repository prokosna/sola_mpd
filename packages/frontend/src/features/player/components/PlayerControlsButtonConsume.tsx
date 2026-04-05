import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { IconEraser, IconEraserOff } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { mpdClientAtom } from "../../mpd";
import { currentMpdProfileAtom } from "../../profile";
import { playerStatusIsConsumeAtom } from "../states/atoms/playerStatusAtom";
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
	const profile = useAtomValue(currentMpdProfileAtom);
	const mpdClient = useAtomValue(mpdClientAtom);
	const playerStatusIsConsume = useAtomValue(playerStatusIsConsumeAtom);

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}
		mpdClient.command(
			create(MpdRequestSchema, {
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
