import { IconEraser, IconEraserOff } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { toggleConsumeActionAtom } from "../states/actions/toggleConsumeActionAtom";
import { playerStatusIsConsumeAtom } from "../states/atoms/playerStatusAtom";
import { PlayerControlsButton } from "./PlayerControlsButton";

export function PlayerControlsButtonConsume() {
	const playerStatusIsConsume = useAtomValue(playerStatusIsConsumeAtom);
	const toggleConsume = useSetAtom(toggleConsumeActionAtom);

	const onButtonClicked = useCallback(() => {
		toggleConsume();
	}, [toggleConsume]);

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
