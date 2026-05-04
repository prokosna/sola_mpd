import { atom } from "jotai";

import { statsAtom } from "../../../stats/states/atoms/statsAtom";
import { supportsAddedSince } from "../../functions/mpdVersion";

export type MpdCapabilities = {
	supportsAddedSince: boolean;
};

export const mpdCapabilitiesAtom = atom<MpdCapabilities>((get) => {
	const stats = get(statsAtom);
	return {
		supportsAddedSince: supportsAddedSince(stats?.version),
	};
});
