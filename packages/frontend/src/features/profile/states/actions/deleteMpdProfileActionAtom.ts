import { atom } from "jotai";
import { showNotification } from "../../../../lib/mantine/showNotification";
import { removeProfileFromState } from "../../functions/profileConstruction";
import { mpdProfileStateAsyncAtom } from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

export const deleteMpdProfileActionAtom = atom(
	null,
	async (get, set, params: { profileName: string }) => {
		const mpdProfileState = await get(mpdProfileStateAsyncAtom);
		const newState = removeProfileFromState(
			mpdProfileState,
			params.profileName,
		);
		if (newState === undefined) {
			return;
		}
		try {
			await get(mpdProfileStateRepositoryAtom).save(newState);
		} catch (e) {
			console.error(e);
			showNotification({
				title: "Could not delete MPD profile",
				description: e instanceof Error ? e.message : String(e),
				status: "error",
			});
			return;
		}
		set(mpdProfileStateAsyncAtom, Promise.resolve(newState));
	},
);
