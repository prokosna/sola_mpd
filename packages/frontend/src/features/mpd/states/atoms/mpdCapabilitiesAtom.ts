import { atom } from "jotai";

import { statsAtom } from "../../../stats/states/atoms/statsAtom";
import { isMpd024OrLater } from "../../functions/mpdVersion";

export type MpdCapabilities = {
	isMpd024OrLater: boolean;
};

export const mpdCapabilitiesAtom = atom<MpdCapabilities>((get) => {
	const stats = get(statsAtom);
	return {
		isMpd024OrLater: isMpd024OrLater(stats?.version),
	};
});
