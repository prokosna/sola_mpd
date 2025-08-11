import { Divider, Group, Stack } from "@mantine/core";
import { useSelectedSongsState } from "../../song_table";
import { useAlbumStatsProps } from "../hooks/useAlbumStatsProps";
import { useArtistStatsProps } from "../hooks/useArtistStatsProps";
import { useDurationStatsProps } from "../hooks/useDurationStatsProps";
import { useSongStatsProps } from "../hooks/useSongStatsProps";
import { MantineCardStatsDatabaseButton } from "./MantineCardStatsDatabaseButton";
import { MantineCardStatsNumber } from "./MantineCardStatsNumber";

/**
 * CardStats component displays various statistics about the music library.
 * It shows information such as total songs, artists, albums, and duration.
 * When multiple songs are selected, it switches to display stats for the selection.
 * It also includes a button to update the MPD database.
 *
 * @returns {JSX.Element} The rendered CardStats component
 */
export function MantineCardStats() {
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
			<Stack w="100%" h="full" gap={1}>
				<MantineCardStatsNumber {...songStatsProps} />
				<Divider my={2} />
				<MantineCardStatsNumber {...artistStatsProps} />
				<Divider my={2} />
				<MantineCardStatsNumber {...albumStatsProps} />
				<Divider my={2} />
				<MantineCardStatsNumber {...durationStatsProps} />
				<Divider my={2} />
				<Group my={2}>
					<MantineCardStatsDatabaseButton />
				</Group>
			</Stack>
		</>
	);
}
