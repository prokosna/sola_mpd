import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { formatSongInformationLines } from "../functions/playerInformation";
import { currentSongAtom } from "../states/atoms/currentSongAtom";

export function useCurrentSongInformationLines() {
	const song = useAtomValue(currentSongAtom);
	return useMemo(() => formatSongInformationLines(song), [song]);
}
