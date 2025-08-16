import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";

import { useMpdClientState } from "../../mpd";
import { useCurrentMpdProfileState } from "../../profile";
import { usePlayerStatusIsRepeatState } from "../states/playerStatusState";

import { IconRepeat, IconRepeatOff } from "@tabler/icons-react";
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
	const mpdClient = useMpdClientState();
	const playerStatusIsRepeat = usePlayerStatusIsRepeatState();

	const onButtonClicked = useCallback(async () => {
		if (mpdClient === undefined) {
			return;
		}

		mpdClient.command(
			new MpdRequest({
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

	return (
		<>
			<PlayerControlsButton {...props} />
		</>
	);
}
