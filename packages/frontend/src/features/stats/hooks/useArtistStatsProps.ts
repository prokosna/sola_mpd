import { Song, Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import { CardStatsNumberProps } from "../components/CardStatsNumber";
import { getCountDistinct } from "../helpers/stats";
import { useStatsState } from "../states/stats";

export function useArtistStatsProps(
  isSelected: boolean,
  selectedSongs: Song[],
): CardStatsNumberProps {
  const stats = useStatsState();

  const count = useMemo(() => {
    if (stats === undefined) {
      return undefined;
    }
    if (isSelected) {
      return getCountDistinct(selectedSongs, Song_MetadataTag.ARTIST);
    }
    return stats.artistsCount;
  }, [isSelected, selectedSongs, stats]);

  return {
    isSelected,
    label: isSelected ? "Artists from Selected Songs" : "Total Artists in DB",
    count,
  };
}
