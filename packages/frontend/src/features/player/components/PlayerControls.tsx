import { Divider } from "@mantine/core";
import { PlayerControlsButtonConsume } from "./PlayerControlsButtonConsume";
import { PlayerControlsButtonNext } from "./PlayerControlsButtonNext";
import { PlayerControlsButtonPrevious } from "./PlayerControlsButtonPrevious";
import { PlayerControlsButtonRandom } from "./PlayerControlsButtonRandom";
import { PlayerControlsButtonRepeat } from "./PlayerControlsButtonRepeat";
import { PlayerControlsButtonResume } from "./PlayerControlsButtonResume";
import { PlayerControlsButtonStop } from "./PlayerControlsButtonStop";
import { PlayerControlsButtonVolume } from "./PlayerControlsButtonVolume";

export function PlayerControls() {
	return (
		<>
			<PlayerControlsButtonPrevious />
			<PlayerControlsButtonStop />
			<PlayerControlsButtonResume />
			<PlayerControlsButtonNext />

			<Divider orientation="vertical" mx={8} />

			<PlayerControlsButtonRandom />
			<PlayerControlsButtonRepeat />
			<PlayerControlsButtonConsume />

			<Divider orientation="vertical" mx={8} />

			<PlayerControlsButtonVolume />
		</>
	);
}
