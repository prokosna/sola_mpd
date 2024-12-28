import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import { CardStatsNumberProps } from "../components/CardStatsNumber";
import { useStatsState } from "../states/statsState";

/**
 * Custom hook to generate props for song statistics.
 *
 * @param showSelectedStats - Boolean flag to determine if stats for selected songs should be shown.
 * @param selectedSongs - Array of selected Song objects.
 * @returns CardStatsNumberProps object containing song statistics.
 */
export function useSongStatsProps(
  showSelectedStats: boolean,
  selectedSongs: Song[],
): CardStatsNumberProps {
  const stats = useStatsState();

  const count = useMemo(() => {
    if (stats === undefined) {
      return undefined;
    }
    if (showSelectedStats) {
      return selectedSongs.length;
    }
    return stats.songsCount;
  }, [showSelectedStats, selectedSongs.length, stats]);

  return {
    isSelected: showSelectedStats,
    label: showSelectedStats ? "Selected Songs" : "Total Songs",
    count,
  };
}
