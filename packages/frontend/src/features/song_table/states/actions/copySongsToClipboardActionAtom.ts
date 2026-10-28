import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { atom } from "jotai";

import { convertSongsToTsv } from "../../functions/songTableClipboard";
import type { SongTableColumnView } from "../../types/songTableTypes";
import { clipboardAtom } from "../atoms/clipboardAtom";

export const copySongsToClipboardActionAtom = atom(
	null,
	async (
		get,
		_set,
		params: { songs: Song[]; columns: SongTableColumnView[] },
	) => {
		const clipboard = get(clipboardAtom);
		await clipboard.writeText(convertSongsToTsv(params.songs, params.columns));
	},
);
