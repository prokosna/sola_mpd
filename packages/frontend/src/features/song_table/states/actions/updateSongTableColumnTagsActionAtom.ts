import { clone } from "@bufbuild/protobuf";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import {
	songTableServerStateAtom,
	songTableStateAsyncAtom,
} from "../atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

/**
 * The only writer of the shared column set (DESIGN.md §6). Clones the
 * fetched document and sets only `column_tags`, which is what keeps the
 * deprecated fields the backend save-guard and the device migration rely on
 * intact — never construct a fresh message here.
 */
export const updateSongTableColumnTagsActionAtom = atom(
	null,
	async (get, set, tags: Song_MetadataTag[]) => {
		const current = get(songTableServerStateAtom);
		if (current === undefined) {
			return;
		}
		const newState = clone(SongTableStateSchema, current);
		newState.columnTags = tags;

		try {
			await get(songTableStateRepositoryAtom).save(newState);
		} catch (e) {
			console.error(e);
			showNotification({
				title: "Could not save song table columns",
				description: e instanceof Error ? e.message : String(e),
				status: "error",
			});
			return;
		}
		set(songTableStateAsyncAtom, newState);
	},
);
