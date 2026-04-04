import { create } from "@bufbuild/protobuf";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { IconRepeat, IconRepeatOff } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { mpdClientAtom } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { playerStatusIsRepeatAtom } from "../states/atoms/playerStatusAtom";
import { PlayerControlsButton } from "./PlayerControlsButton";

/**
 * Button for toggling repeat mode.
 *
 * Controls whether the playlist repeats after reaching the end.
 * Updates button state based on current repeat mode status.
 *
 * @returns Repeat mode toggle button
 */
export function PlayerControlsButtonRepeat() {
	const profile = useCurrentMpdProfileState();
	const mpdClient = useAtomValue(mpdClientAtom);
	const playerStatusIsRepeat = useAtomValue(playerStatusIsRepeatAtom);

	const onButtonClicked = useCallback(async () => {
		if (mpdClient === undefined) {
			return;
		}

		mpdClient.command(
			create(MpdRequestSchema, {
				profile,
				command: {
					case: "repeat",
					value: {
						enable: !playerStatusIsRepeat,
					},
				},
			}),
		);
	}, [mpdClient, playerStatusIsRepeat, profile]);

	const props = {
		label: playerStatusIsRepeat ? "Repeat enabled" : "Repeat disabled",
		isDisabled: false,
		onButtonClicked,
		icon: playerStatusIsRepeat ? (
			<IconRepeat size={"24"} />
		) : (
			<IconRepeatOff size={"24"} />
		),
		variant: "transparent",
	};

	return <PlayerControlsButton {...props} />;
}
