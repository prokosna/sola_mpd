import { create, toJsonString } from "@bufbuild/protobuf";
import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { FilterCondition } from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../../mpd";
import { convertBrowserFilterToCondition } from "../functions/browserFilter";

export async function fetchBrowserFilterValues(
	mpdClient: MpdClient,
	profile: MpdProfile,
	browserFilters: BrowserFilter[],
	collator: Intl.Collator,
): Promise<Map<Song_MetadataTag, string[]>> {
	const selectedSortedFilters = Array.from(
		browserFilters.filter(
			(browserFilter) => browserFilter.selectedValues.length !== 0,
		),
	).sort((a, b) => a.selectedOrder - b.selectedOrder);

	const browserFilterValuesPairs: [Song_MetadataTag, string[]][] =
		await Promise.all(
			browserFilters.map(async (browserFilter) => {
				const conditions: FilterCondition[] = [];
				if (browserFilter.selectedOrder !== 1) {
					for (const selectedFilter of selectedSortedFilters) {
						if (browserFilter === selectedFilter) {
							break;
						}
						const condition = convertBrowserFilterToCondition(selectedFilter);
						if (condition === undefined) {
							continue;
						}
						conditions.push(condition);
					}
				}

				const req = create(MpdRequestSchema, {
					profile,
					command: {
						case: "list",
						value: {
							tag: browserFilter.tag,
							conditions,
						},
					},
				});
				const res = await mpdClient.command(req);
				if (res.command.case !== "list") {
					throw Error(
						`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
					);
				}
				const values = res.command.value.values;
				const sortedValues = values.sort((a, b) => collator.compare(a, b));
				return [browserFilter.tag, sortedValues];
			}),
		);

	return new Map(browserFilterValuesPairs);
}
