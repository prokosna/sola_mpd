import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { classifyAudioFormat } from "../functions/playerFormat";
import { currentSongAtom } from "../states/atoms/currentSongAtom";

export function useCurrentSongFormat() {
	const song = useAtomValue(currentSongAtom);

	return useMemo(() => {
		if (song === undefined) {
			return classifyAudioFormat(undefined);
		}
		const format = song.metadata[Song_MetadataTag.FORMAT];
		if (format.value.case === "format") {
			return classifyAudioFormat(format.value.value);
		}
		return classifyAudioFormat(undefined);
	}, [song]);
}
