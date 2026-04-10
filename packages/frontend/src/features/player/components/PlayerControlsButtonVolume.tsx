import {
	ActionIcon,
	Box,
	Slider,
	Tooltip,
	useMantineTheme,
} from "@mantine/core";
import { IconVolumeOff } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useIsCompactMode } from "../../user_device";
import { setVolumeActionAtom } from "../states/actions/setVolumeActionAtom";
import { playerVolumeAtom } from "../states/atoms/playerVolumeAtom";

export function PlayerControlsButtonVolume() {
	const playerVolume = useAtomValue(playerVolumeAtom);
	const setVolume = useSetAtom(setVolumeActionAtom);
	const isCompact = useIsCompactMode();

	const volume = playerVolume?.volume !== undefined ? playerVolume.volume : -1;

	const theme = useMantineTheme();

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
						onChangeEnd={(v) => setVolume(v)}
					/>
				</Box>
			)}
		</>
	);
}
