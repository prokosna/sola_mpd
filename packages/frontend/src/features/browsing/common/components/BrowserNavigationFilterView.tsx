import { Group } from "@mantine/core";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { FullWidthSkeleton } from "../../../loading";
import { SelectList } from "../../../select_list";
import { useBrowserNavigationFilterSelectListProps } from "../hooks/useBrowserNavigationFilterSelectListProps";
import type { BrowserFilterView } from "../types/browserFilterView";

export type BrowserNavigationFilterViewProps = {
	browserFilter: BrowserFilterView;
	values?: string[];
	browserFilters?: BrowserFilterView[];
	availableTags: Song_MetadataTag[];
	updateBrowserFilters: (browserFilters: BrowserFilterView[]) => Promise<void>;
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
