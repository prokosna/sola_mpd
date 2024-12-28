import { Song, Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import { CardStatsNumberProps } from "../components/CardStatsNumber";
import { useStatsState } from "../states/statsState";
import { getMetadataValueCountDistinct } from "../utils/statsUtils";

/**
 * Custom hook to generate props for artist statistics.
 *
 * @param showSelectedStats - Boolean flag to determine if stats for selected songs should be shown.
 * @param selectedSongs - Array of selected Song objects.
 * @returns CardStatsNumberProps object containing artist statistics.
 */
export function useArtistStatsProps(
  showSelectedStats: boolean,
  selectedSongs: Song[],
): CardStatsNumberProps {
  const stats = useStatsState();

  const count = useMemo(() => {
    if (stats === undefined) {
      return undefined;
    }
    if (showSelectedStats) {
      return getMetadataValueCountDistinct(
        selectedSongs,
        Song_MetadataTag.ARTIST,
      );
    }
    return stats.artistsCount;
  }, [showSelectedStats, selectedSongs, stats]);

  return {
    isSelected: showSelectedStats,
    label: showSelectedStats ? "Artists of Selected Songs" : "Total Artists",
    count,
  };
}
