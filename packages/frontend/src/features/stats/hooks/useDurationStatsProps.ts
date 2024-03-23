import { Song, Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { StringUtils } from "@sola_mpd/domain/src/utils/StringUtils.js";
import { useMemo } from "react";

import { CardStatsNumberProps } from "../components/CardStatsNumber";
import { useStatsState } from "../states/stats";

export function useDurationStatsProps(
  isSelected: boolean,
  selectedSongs: Song[],
): CardStatsNumberProps {
  const stats = useStatsState();

  const count = useMemo(() => {
    if (stats === undefined) {
      return undefined;
    }
    if (isSelected) {
      return StringUtils.displayDuration(
        selectedSongs
          .map((song) =>
            SongUtils.getSongMetadataAsNumber(song, Song_MetadataTag.DURATION),
          )
          .filter((value) => value !== undefined)
          .filter((value) => !isNaN(Number(value)))
          .reduce((a, b) => (a as number) + (b as number), 0) as number,
      );
    }
    return StringUtils.displayDuration(stats.totalPlaytime);
  }, [isSelected, selectedSongs, stats]);

  return {
    isSelected,
    label: isSelected ? "Selected Songs Duration" : "Total Duration",
    count,
  };
}
