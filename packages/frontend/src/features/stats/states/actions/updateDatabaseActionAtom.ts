import { atom } from "jotai";

import { mpdClientAtom } from "../../../mpd";
import { currentMpdProfileAtom } from "../../../profile";
import { buildUpdateDatabaseCommand } from "../../functions/statsFetching";

export const updateDatabaseActionAtom = atom(null, async (get, _set) => {
	const mpdClient = get(mpdClientAtom);
	const profile = get(currentMpdProfileAtom);
	if (mpdClient === undefined || profile === undefined) {
		return;
	}
	await mpdClient.command(buildUpdateDatabaseCommand(profile));
});
