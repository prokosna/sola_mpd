import { atom } from "jotai";

import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";

export const resetSongTableSearchWidthActionAtom = atom(
	null,
	(get, set, searchName: string) => {
		const current = get(songTableDeviceLayoutAtom);
		if (current?.widthFlexByTagBySearchName?.[searchName] === undefined) {
			return;
		}
		const { [searchName]: _dropped, ...rest } =
			current.widthFlexByTagBySearchName;
		set(songTableDeviceLayoutAtom, {
			...current,
			widthFlexByTagBySearchName: rest,
		});
	},
);
