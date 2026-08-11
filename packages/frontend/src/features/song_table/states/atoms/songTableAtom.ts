import { clone } from "@bufbuild/protobuf";
import {
	SongTableColumnSchema,
	type SongTableState,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { applyDeviceColumnWidths } from "../../functions/applyDeviceColumnWidths";
import { songTableColumnLayoutKeyForTag } from "../../functions/songTableColumnLayout";

import { songTableColumnLayoutAtom } from "./songTableColumnLayoutAtom";
import { songTableStateRepositoryAtom } from "./songTableStateRepositoryAtom";

export const songTableStateAsyncAtom = atomWithDefault<
	Promise<SongTableState> | SongTableState
>(async (get) => {
	const repository = get(songTableStateRepositoryAtom);
	return await repository.fetch();
});

// The server's raw view, where only `columns[].tag` and its order are still
// authoritative. Exported only for the Raw Data editor, which has to show the
// genuine on-disk document; every UI consumer reads songTableStateAtom below.
export const songTableServerStateAtom = atomWithSync(songTableStateAsyncAtom);

export const songTableStateAtom = atom((get) => {
	const serverState = get(songTableServerStateAtom);
	if (serverState === undefined) {
		return undefined;
	}

	const layout = get(songTableColumnLayoutAtom);
	const columns = serverState.columns.map((column) => {
		const entry = layout[songTableColumnLayoutKeyForTag(column.tag)];
		const updated = clone(SongTableColumnSchema, column);
		updated.sortOrder = entry?.sortOrder;
		updated.isSortDesc = entry?.isSortDesc ?? false;
		return updated;
	});

	const result = clone(SongTableStateSchema, serverState);
	result.columns = applyDeviceColumnWidths(columns, layout);
	return result;
});
