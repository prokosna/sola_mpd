import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";
import type { SongTableDeviceLayoutSort } from "../../types/songTableTypes";
import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";

export type SongTableDeviceLayoutPatch = {
	/** Merged over the current map, so other tags' widths are never lost. */
	widthFlexByTag?: Partial<Record<Song_MetadataTag, number>>;
	/** Routes `widthFlexByTag` into this saved search's own map, not the shared one. */
	searchName?: string;
	/** Replaces the current list outright: sort is always supplied whole. */
	sort?: SongTableDeviceLayoutSort[];
};

// The only writer of device-owned width and sort. Silently does nothing while
// the one-time migration is pending, which is when the atom refuses writes.
export const updateSongTableDeviceLayoutActionAtom = atom(
	null,
	(get, set, patch: SongTableDeviceLayoutPatch) => {
		const current = get(songTableDeviceLayoutAtom);
		if (current === undefined) {
			return;
		}
		const sort = patch.sort !== undefined ? patch.sort : current.sort;
		if (patch.widthFlexByTag !== undefined && patch.searchName !== undefined) {
			const searchName = patch.searchName;
			set(songTableDeviceLayoutAtom, {
				...current,
				widthFlexByTagBySearchName: {
					...current.widthFlexByTagBySearchName,
					[searchName]: {
						...current.widthFlexByTagBySearchName?.[searchName],
						...patch.widthFlexByTag,
					},
				},
				sort,
			});
			return;
		}
		set(songTableDeviceLayoutAtom, {
			...current,
			widthFlexByTag:
				patch.widthFlexByTag !== undefined
					? { ...current.widthFlexByTag, ...patch.widthFlexByTag }
					: current.widthFlexByTag,
			sort,
		});
	},
);
