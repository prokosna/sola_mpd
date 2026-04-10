import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildClearQueueCommands } from "../../functions/playQueueSongOperations";

export const clearQueueActionAtom = atom(null, async (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	const commands = buildClearQueueCommands(profile);
	await mpdClient.commandBulk(commands);
});
