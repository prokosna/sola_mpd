import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import clsx from "clsx";
import * as React from "react";
import {
	Panel,
	Group as PanelGroup,
	Separator,
	useDefaultLayout,
} from "react-resizable-panels";
import styles from "../../../../ResizeHandle.module.css";
import { FullWidthSkeleton } from "../../../loading";
import { convertSongMetadataTagToDisplayName } from "../../../song_table";
import {
	buildBrowserNavigationPanelIds,
	listBrowserSongMetadataTags,
} from "../functions/browserFilter";
import type { BrowserFilterView } from "../types/browserFilterView";
import { BrowserNavigationFilterView } from "./BrowserNavigationFilterView";

type BrowserNavigationViewProps = {
	browserFilters?: BrowserFilterView[];
	browserFilterValues?: Map<Song_MetadataTag, string[]>;
	updateBrowserFilters: (browserFilters: BrowserFilterView[]) => Promise<void>;
	onScrolledNearBottom?: () => void;
};

export function BrowserNavigationView(props: BrowserNavigationViewProps) {
	const {
		browserFilters,
		browserFilterValues,
		updateBrowserFilters,
		onScrolledNearBottom,
	} = props;
	const resolvedBrowserFilters = browserFilters ?? [];

	const usedTags = resolvedBrowserFilters.map((filter) => filter.tag);
	const availableTags = listBrowserSongMetadataTags().filter(
		(tag) => !usedTags.includes(tag),
	);
	const panelIds = buildBrowserNavigationPanelIds(usedTags);
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
			{resolvedBrowserFilters.map((browserFilter, index, array) => (
				<React.Fragment key={browserFilter.tag}>
					<Panel
						minSize="10%"
						id={convertSongMetadataTagToDisplayName(browserFilter.tag)}
					>
						<BrowserNavigationFilterView
							{...{
								browserFilter,
								values: browserFilterValues?.get(browserFilter.tag),
								browserFilters: resolvedBrowserFilters,
								availableTags,
								updateBrowserFilters,
								onScrolledNearBottom,
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
