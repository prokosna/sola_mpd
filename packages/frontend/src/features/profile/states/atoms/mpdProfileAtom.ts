import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";

import { mpdProfileStateRepositoryAtom } from "./mpdProfileStateRepositoryAtom";

export const mpdProfileStateAsyncAtom = atomWithDefault(async (get) => {
	const repository = get(mpdProfileStateRepositoryAtom);
	return repository.fetch();
});

export const mpdProfileStateAtom = atomWithSync(mpdProfileStateAsyncAtom);

export const currentMpdProfileAtom = atom((get) => {
	const profileState = get(mpdProfileStateAtom);
	return profileState?.currentProfile;
});
