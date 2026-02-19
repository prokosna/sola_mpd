import type { BrowserFilter } from "@sola_mpd/domain/src/models/browser_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import clsx from "clsx";
import * as React from "react";
import {
	Panel,
	Group as PanelGroup,
	Separator,
	useDefaultLayout,
} from "react-resizable-panels";
import styles from "../../../../ResizeHandle.module.css";
import type { UpdateMode } from "../../../../types/stateTypes";
import { FullWidthSkeleton } from "../../../loading";
import { convertSongMetadataTagToDisplayName } from "../../../song_table";
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
	const resolvedBrowserFilters = browserFilters ?? [];

	const usedTags = resolvedBrowserFilters.map((filter) => filter.tag);
	const availableTags = listBrowserSongMetadataTags().filter(
		(tag) => !usedTags.includes(tag),
	);
	const sortedBrowserFilters = [...resolvedBrowserFilters].sort(
		(a, b) => a.order - b.order,
	);
	const panelIds = sortedBrowserFilters.map((browserFilter) =>
		convertSongMetadataTagToDisplayName(browserFilter.tag),
	);
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "browser-navigation-view",
		panelIds,
		storage: globalThis.localStorage,
	});

	if (browserFilters === undefined) {
		return <FullWidthSkeleton />;
	}

	return (
		<PanelGroup
			orientation="vertical"
			defaultLayout={defaultLayout}
			onLayoutChanged={onLayoutChanged}
		>
			{sortedBrowserFilters.map((browserFilter, index, array) => (
				<React.Fragment key={browserFilter.tag}>
					<Panel
						minSize="10%"
						id={convertSongMetadataTagToDisplayName(browserFilter.tag)}
					>
						<BrowserNavigationFilterView
							{...{
								browserFilter,
								values: browserFilterValues?.get(browserFilter.tag),
								browserFilters: sortedBrowserFilters,
								availableTags,
								updateBrowserFilters,
							}}
						/>
					</Panel>
					{index < array.length - 1 && (
						<Separator className={clsx(styles.handle, styles.horizontal)} />
					)}
				</React.Fragment>
			))}
		</PanelGroup>
	);
}
