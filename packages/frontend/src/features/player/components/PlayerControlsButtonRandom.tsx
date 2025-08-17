import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { IconArrowsRight, IconArrowsShuffle } from "@tabler/icons-react";
import { useCallback } from "react";
import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { usePlayerStatusIsRandomState } from "../states/playerStatusState";
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
	const profile = useCurrentMpdProfileState();
	const mpdClient = useMpdClientState();
	const playerStatusIsRandom = usePlayerStatusIsRandomState();

	const onButtonClicked = useCallback(async () => {
		if (profile === undefined || mpdClient === undefined) {
			return;
		}

		mpdClient.command(
			create(MpdRequestSchema, {
				profile,
				command: {
					case: "random",
					value: {
						enable: !playerStatusIsRandom,
					},
				},
			}),
		);
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
