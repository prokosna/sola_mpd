import { Box, Divider } from "@chakra-ui/react";

import { useSelectedSongsState } from "../../song_table";
import { useAlbumStatsProps } from "../hooks/useAlbumStatsProps";
import { useArtistStatsProps } from "../hooks/useArtistStatsProps";
import { useDurationStatsProps } from "../hooks/useDurationStatsProps";
import { useSongStatsProps } from "../hooks/useSongStatsProps";

import { CardStatsDatabaseButton } from "./CardStatsDatabaseButton";
import { CardStatsNumber } from "./CardStatsNumber";

export function CardStats() {
  const selectedSongs = useSelectedSongsState();
  const isSelected = selectedSongs.length >= 2;
  const songStatsProps = useSongStatsProps(isSelected, selectedSongs);
  const artistStatsProps = useArtistStatsProps(isSelected, selectedSongs);
  const albumStatsProps = useAlbumStatsProps(isSelected, selectedSongs);
  const durationStatsProps = useDurationStatsProps(isSelected, selectedSongs);

  return (
    <>
      <Box w="100%" h="full" pb={0} px={6} pt={2}>
        <CardStatsNumber {...songStatsProps} />
        <Divider mb={2}></Divider>
        <CardStatsNumber {...artistStatsProps} />
        <Divider mb={2}></Divider>
        <CardStatsNumber {...albumStatsProps} />
        <Divider mb={2}></Divider>
        <CardStatsNumber {...durationStatsProps} />
        <Divider mb={2}></Divider>
        <Box pb={2}>
          <CardStatsDatabaseButton />
        </Box>
      </Box>
    </>
  );
}
