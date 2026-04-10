import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import { useMemo } from "react";

import { assignSongIndices } from "../functions/songTableIndex";

export function useSongsWithIndex(songs: Song[]): Song[] {
	return useMemo(() => assignSongIndices(songs), [songs]);
}
