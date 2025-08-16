import { Box } from "@mantine/core";
import { FullWidthSkeleton } from "../../loading";
import { SelectList } from "../../select_list";
import { usePlaylistNavigationSelectListProps } from "../hooks/usePlaylistNavigationSelectListProps";

/**
 * Navigation sidebar for playlists.
 *
 * Displays selectable list of playlists with loading state.
 *
 * @returns Navigation component
 */
export function PlaylistNavigation() {
	const selectListProps = usePlaylistNavigationSelectListProps();

	if (selectListProps === undefined) {
		return <FullWidthSkeleton />;
	}

	return (
		<>
			<Box w="100%" h="100%">
				<SelectList {...selectListProps} />
			</Box>
		</>
	);
}
