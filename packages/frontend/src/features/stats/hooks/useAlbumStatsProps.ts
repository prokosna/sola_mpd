import { Song, Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { useMemo } from "react";

import { CardStatsNumberProps } from "../components/CardStatsNumber";
import { getCountDistinct } from "../helpers/stats";
import { useStatsState } from "../states/stats";

export function useAlbumStatsProps(
  isSelected: boolean,
  selectedSongs: Song[],
): CardStatsNumberProps {
  const stats = useStatsState();

  const count = useMemo(() => {
    if (stats === undefined) {
      return undefined;
    }
    if (isSelected) {
      return getCountDistinct(selectedSongs, Song_MetadataTag.ALBUM);
    }
    return stats.albumsCount;
  }, [isSelected, selectedSongs, stats]);

  return {
    isSelected,
    label: isSelected ? "Albums of Selected Songs" : "Total Albums",
    count,
  };
}
