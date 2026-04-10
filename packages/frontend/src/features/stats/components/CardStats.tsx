import { Divider, Stack } from "@mantine/core";
import { useAtomValue } from "jotai";
import { selectedSongsAtom } from "../../song_table";
import { useAlbumStatsProps } from "../hooks/useAlbumStatsProps";
import { useArtistStatsProps } from "../hooks/useArtistStatsProps";
import { useDurationStatsProps } from "../hooks/useDurationStatsProps";
import { useSongStatsProps } from "../hooks/useSongStatsProps";
import { CardStatsDatabaseButton } from "./CardStatsDatabaseButton";
import { CardStatsNumber } from "./CardStatsNumber";

export function CardStats() {
	const selectedSongs = useAtomValue(selectedSongsAtom);
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
		<Stack w="100%" h="100%" gap={4}>
			<CardStatsNumber {...songStatsProps} />
			<Divider />
			<CardStatsNumber {...artistStatsProps} />
			<Divider />
			<CardStatsNumber {...albumStatsProps} />
			<Divider />
			<CardStatsNumber {...durationStatsProps} />
			<Divider pb={6} />
			<CardStatsDatabaseButton />
		</Stack>
	);
}
