import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import { CardStatsNumberProps } from "../components/CardStatsNumber";
import { useStatsState } from "../states/stats";

export function useSongStatsProps(
  isSelected: boolean,
  selectedSongs: Song[],
): CardStatsNumberProps {
  const stats = useStatsState();

  const count = useMemo(() => {
    if (stats === undefined) {
      return undefined;
    }
    if (isSelected) {
      return selectedSongs.length;
    }
    return stats.songsCount;
  }, [isSelected, selectedSongs.length, stats]);

  return {
    isSelected,
    label: isSelected ? "Songs Selected" : "Total Songs in DB",
    count,
  };
}
