import {
	type SongTableState,
	SongTableStateSchema,
} from "@sola_mpd/shared/src/models/song_table_pb.js";
import { useAtomValue, useSetAtom } from "jotai";
import { UpdateMode } from "../../../types/stateTypes";
import {
	songTableServerStateAtom,
	updateSongTableServerStateActionAtom,
} from "../../song_table";
import type { SettingsStatesEditorProps } from "../components/SettingsStatesEditor";
import { useSettingsStateEditorProps } from "./useSettingsStateEditorProps";

// Raw Data must edit the genuine server document, not the device-composed
// songTableStateAtom the rest of the app reads.
export function useRawSongTableStateEditorProps(): [
	() => void,
	SettingsStatesEditorProps<SongTableState> | undefined,
] {
	const songTableServerState = useAtomValue(songTableServerStateAtom);
	const updateSongTableServerState = useSetAtom(
		updateSongTableServerStateActionAtom,
	);

	return useSettingsStateEditorProps<SongTableState>(
		SongTableStateSchema,
		songTableServerState,
		async (newState: SongTableState) => {
			updateSongTableServerState({
				state: newState,
				mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			});
		},
	);
}
