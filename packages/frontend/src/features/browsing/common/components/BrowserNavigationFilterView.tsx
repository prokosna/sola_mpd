import { Group } from "@mantine/core";
import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import type { UpdateMode } from "../../../../types/stateTypes";
import { FullWidthSkeleton } from "../../../loading";
import { SelectList } from "../../../select_list";
import { useBrowserNavigationFilterSelectListProps } from "../hooks/useBrowserNavigationFilterSelectListProps";

export type BrowserNavigationFilterViewProps = {
	browserFilter: BrowserFilter;
	values?: string[];
	browserFilters?: BrowserFilter[];
	availableTags: Song_MetadataTag[];
	updateBrowserFilters: (
		browserFilters: BrowserFilter[],
		mode: UpdateMode,
	) => Promise<void>;
	onScrolledNearBottom?: () => void;
};

export function BrowserNavigationFilterView(
	props: BrowserNavigationFilterViewProps,
) {
	const selectListProps = useBrowserNavigationFilterSelectListProps(props);

	if (selectListProps === undefined) {
		return <FullWidthSkeleton />;
	}

	return (
		<Group w="100%" h="100%">
			<SelectList {...selectListProps} />
		</Group>
	);
}
