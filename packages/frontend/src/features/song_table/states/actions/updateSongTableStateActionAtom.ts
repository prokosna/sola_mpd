import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { UpdateMode } from "../../../../types/stateTypes";
import { diffSongTableColumns } from "../../functions/diffSongTableColumns";
import { buildSongTableColumnLayout } from "../../functions/songTableColumnLayout";
import {
	songTableStateAsyncAtom,
	songTableStateAtom,
} from "../atoms/songTableAtom";
import { songTableColumnLayoutAtom } from "../atoms/songTableColumnLayoutAtom";
import { songTableStateRepositoryAtom } from "../atoms/songTableStateRepositoryAtom";

// Splits writes between Workspace (server) and Device: `tag`/order is
// Workspace, while sort_order/is_sort_desc/width_flex are Device. The ~19
// AG Grid call sites
// funnel through this one action unchanged, so this is the only place that
// needs to know about the split.
export const updateSongTableStateActionAtom = atom(
	null,
	async (get, set, params: { state: SongTableState; mode: UpdateMode }) => {
		const currentColumns = get(songTableStateAtom)?.columns ?? [];
		const diff = diffSongTableColumns(currentColumns, params.state.columns);

		if (diff.tagsChanged) {
			if (params.mode & UpdateMode.PERSIST) {
				try {
					await get(songTableStateRepositoryAtom).save(params.state);
				} catch (e) {
					console.error(e);
					showNotification({
						title: "Could not save song table layout",
						description: e instanceof Error ? e.message : String(e),
						status: "error",
					});
					return;
				}
			}
			if (params.mode & UpdateMode.LOCAL_STATE) {
				set(songTableStateAsyncAtom, params.state);
			}
			return;
		}

		if (diff.sortChanged || diff.widthChanged) {
			set(
				songTableColumnLayoutAtom,
				buildSongTableColumnLayout(params.state.columns),
			);
		}
	},
);
