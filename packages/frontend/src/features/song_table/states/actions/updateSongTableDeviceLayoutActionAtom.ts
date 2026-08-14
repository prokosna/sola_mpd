import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";
import type { SongTableDeviceLayoutSort } from "../../types/songTableTypes";
import { songTableDeviceLayoutAtom } from "../atoms/songTableDeviceLayoutAtom";

export type SongTableDeviceLayoutPatch = {
	/** Merged over the current map, so other tags' widths are never lost. */
	widthFlexByTag?: Partial<Record<Song_MetadataTag, number>>;
	/** Replaces the current list outright: sort is always supplied whole. */
	sort?: SongTableDeviceLayoutSort[];
};

/**
 * The only writer of device-owned width and sort (DESIGN.md §6). A no-op
 * while the one-time migration is still pending, since the underlying atom
 * refuses writes until it resolves.
 */
export const updateSongTableDeviceLayoutActionAtom = atom(
	null,
	(get, set, patch: SongTableDeviceLayoutPatch) => {
		const current = get(songTableDeviceLayoutAtom);
		if (current === undefined) {
			return;
		}
		set(songTableDeviceLayoutAtom, {
			widthFlexByTag:
				patch.widthFlexByTag !== undefined
					? { ...current.widthFlexByTag, ...patch.widthFlexByTag }
					: current.widthFlexByTag,
			sort: patch.sort !== undefined ? patch.sort : current.sort,
		});
	},
);
