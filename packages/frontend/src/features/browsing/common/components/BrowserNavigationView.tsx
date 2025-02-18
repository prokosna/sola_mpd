import { VStack, useColorMode } from "@chakra-ui/react";
import { Allotment } from "allotment";

import type { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import type { UpdateMode } from "../../../../types/stateTypes";
import { FullWidthSkeleton } from "../../../loading";
import { listBrowserSongMetadataTags } from "../utils/browserFilterUtils";
import { BrowserNavigationFilterView } from "./BrowserNavigationFilterView";

type BrowserNavigationViewProps = {
	browserFilters?: BrowserFilter[];
	browserFilterValues?: Map<Song_MetadataTag, string[]>;
	updateBrowserFilters: (
		browserFilters: BrowserFilter[],
		mode: UpdateMode,
	) => Promise<void>;
};

/**
 * Renders the navigation view for the browser component.
 *
 * This component displays a list of filters and their corresponding values,
 * allowing users to navigate and filter content in the browser.
 *
 * @param props The properties passed to the component
 * @returns A React component representing the browser navigation view
 */
export function BrowserNavigationView(props: BrowserNavigationViewProps) {
	const { browserFilters, browserFilterValues, updateBrowserFilters } = props;

	const { colorMode } = useColorMode();

	if (browserFilters === undefined) {
		return (
			<FullWidthSkeleton className="layout-border-top layout-border-left" />
		);
	}

	const usedTags = browserFilters.map((filter) => filter.tag);
	const availableTags = listBrowserSongMetadataTags().filter(
		(tag) => !usedTags.includes(tag),
	);

	return (
		<>
			<VStack h="full" spacing={0}>
				<Allotment
					className={
						colorMode === "light" ? "allotment-light" : "allotment-dark"
					}
					vertical={true}
				>
					{browserFilters
						.sort((a, b) => a.order - b.order)
						.map((browserFilter) => (
							<Allotment.Pane key={browserFilter.tag} minSize={20}>
								<BrowserNavigationFilterView
									{...{
										browserFilter,
										values: browserFilterValues?.get(browserFilter.tag),
										browserFilters,
										availableTags,
										updateBrowserFilters,
									}}
								/>
							</Allotment.Pane>
						))}
				</Allotment>
			</VStack>
		</>
	);
}
