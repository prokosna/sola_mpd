import { Box, Divider } from "@chakra-ui/react";

import { useSelectedSongsState } from "../../song_table";
import { useAlbumStatsProps } from "../hooks/useAlbumStatsProps";
import { useArtistStatsProps } from "../hooks/useArtistStatsProps";
import { useDurationStatsProps } from "../hooks/useDurationStatsProps";
import { useSongStatsProps } from "../hooks/useSongStatsProps";

import { CardStatsDatabaseButton } from "./CardStatsDatabaseButton";
import { CardStatsNumber } from "./CardStatsNumber";

/**
 * CardStats component displays various statistics about the music library.
 * It shows information such as total songs, artists, albums, and duration.
 * When multiple songs are selected, it switches to display stats for the selection.
 * It also includes a button to update the MPD database.
 *
 * @returns {JSX.Element} The rendered CardStats component
 */
export function CardStats() {
	const selectedSongs = useSelectedSongsState();
	const showSelectedStats = selectedSongs.length >= 2;
	const songStatsProps = useSongStatsProps(showSelectedStats, selectedSongs);
	const artistStatsProps = useArtistStatsProps(
		showSelectedStats,
		selectedSongs,
	);
	const albumStatsProps = useAlbumStatsProps(showSelectedStats, selectedSongs);
	const durationStatsProps = useDurationStatsProps(
		showSelectedStats,
		selectedSongs,
	);

	return (
		<>
			<Box w="100%" h="full">
				<CardStatsNumber {...songStatsProps} />
				<Divider mb={2} />
				<CardStatsNumber {...artistStatsProps} />
				<Divider mb={2} />
				<CardStatsNumber {...albumStatsProps} />
				<Divider mb={2} />
				<CardStatsNumber {...durationStatsProps} />
				<Divider mb={2} />
				<Box mb={0} pb={0}>
					<CardStatsDatabaseButton />
				</Box>
			</Box>
		</>
	);
}
