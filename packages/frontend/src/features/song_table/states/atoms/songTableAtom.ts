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

// The server's raw view. Only `columns[].tag` and its order are still
// authoritative here — sort_order/is_sort_desc/width_flex are frozen legacy
// values the server no longer receives meaningful writes for. Every UI
// consumer must go
// through songTableStateAtom below, which overlays the device layer; this is
// exported only for the Raw Data settings editor, which is required to show
// and edit the genuine on-disk document rather than the composed view.
export const songTableServerStateAtom = atomWithSync(songTableStateAsyncAtom);

// The composed, device-aware SongTableState every existing consumer reads.
// Trusts only the server's tag list/order and overlays sort_order/
// is_sort_desc/width_flex from the device-local column layout. The exported
// name and shape are unchanged from before the split, so every downstream
// consumer (~19 files) needed no changes.
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
