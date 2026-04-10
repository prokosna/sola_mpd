import { create, toJsonString } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { escapeRegexString } from "@sola_mpd/shared/src/functions/mpdConverters.js";
import { convertSongMetadataValueToString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import type { BrowserFilter } from "@sola_mpd/shared/src/models/browser_pb.js";
import { BrowserFilterSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import {
	type FilterCondition,
	FilterCondition_Operator,
	FilterConditionSchema,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../../mpd";

export function listBrowserSongMetadataTags(): Song_MetadataTag[] {
	return [
		Song_MetadataTag.ALBUM,
		Song_MetadataTag.ALBUM_ARTIST,
		Song_MetadataTag.ARTIST,
		Song_MetadataTag.COMPOSER,
		Song_MetadataTag.GENRE,
	];
}

export function convertBrowserFilterToCondition(
	browserFilter: BrowserFilter,
): FilterCondition | undefined {
	if (browserFilter.selectedValues.length === 0) {
		return undefined;
	}

	if (browserFilter.selectedValues.length === 1) {
		return create(FilterConditionSchema, {
			tag: browserFilter.tag,
			value: browserFilter.selectedValues[0],
			operator: FilterCondition_Operator.EQUAL,
		});
	}

	const regexValue = `^(${browserFilter.selectedValues
		.map((value) => escapeRegexString(convertSongMetadataValueToString(value)))
		.join("|")})$`;
	return create(FilterConditionSchema, {
		tag: browserFilter.tag,
		value: create(Song_MetadataValueSchema, {
			value: {
				case: "stringValue",
				value: create(StringValueSchema, { value: regexValue }),
			},
		}),
		operator: FilterCondition_Operator.REGEX,
	});
}

function cloneFilter(filter: BrowserFilter): BrowserFilter {
	return create(BrowserFilterSchema, {
		tag: filter.tag,
		order: filter.order,
		selectedOrder: filter.selectedOrder,
		selectedValues: [...filter.selectedValues],
	});
}

function normalizeBrowserFilters(filters: BrowserFilter[]): BrowserFilter[] {
	const newFilters = filters.map(cloneFilter);
	newFilters.sort((a, b) => a.order - b.order);
	let order = 0;
	for (const newFilter of newFilters) {
		newFilter.order = order;
		order += 1;

		if (newFilter.selectedValues.length > 0) {
			if (newFilter.selectedOrder < 0) {
				const nextOrderIndex =
					Math.max(0, ...newFilters.map((filter) => filter.selectedOrder)) + 1;
				newFilter.selectedOrder = nextOrderIndex;
			}
		} else {
			newFilter.selectedOrder = -1;
		}
	}

	const minOrderIndex = Math.min(
		...newFilters
			.filter((filter) => filter.selectedOrder > 0)
			.map((filter) => filter.selectedOrder),
	);
	for (const newFilter of newFilters) {
		if (newFilter.selectedOrder > 0) {
			newFilter.selectedOrder -= minOrderIndex - 1;
		}
	}
	return newFilters;
}

export function changeBrowserFilterToTheOtherTag(
	currentFilters: BrowserFilter[],
	target: BrowserFilter,
	next: Song_MetadataTag,
): BrowserFilter[] {
	const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
	if (index < 0) {
		throw new Error(
			`The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
		);
	}
	const newFilters = currentFilters.map((filter, i) =>
		i === index
			? create(BrowserFilterSchema, {
					tag: next,
					order: filter.order,
					selectedOrder: -1,
					selectedValues: [],
				})
			: filter,
	);
	return normalizeBrowserFilters(newFilters);
}

export function addBrowserFilterNext(
	currentFilters: BrowserFilter[],
	target: BrowserFilter,
	next: Song_MetadataTag,
): BrowserFilter[] {
	const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
	if (index < 0) {
		throw new Error(
			`The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
		);
	}
	const targetOrder = currentFilters[index].order;
	const newFilters = currentFilters.map((filter) =>
		filter.order > targetOrder
			? create(BrowserFilterSchema, {
					tag: filter.tag,
					order: filter.order + 1,
					selectedOrder: filter.selectedOrder,
					selectedValues: [...filter.selectedValues],
				})
			: filter,
	);
	newFilters.push(
		create(BrowserFilterSchema, {
			tag: next,
			selectedOrder: -1,
			selectedValues: [],
			order: targetOrder + 1,
		}),
	);
	return normalizeBrowserFilters(newFilters);
}

export function removeBrowserFilter(
	currentFilters: BrowserFilter[],
	target: BrowserFilter,
): BrowserFilter[] {
	const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
	if (index < 0) {
		throw new Error(
			`The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
		);
	}
	const newFilters = [...currentFilters];
	newFilters.splice(index, 1);
	return normalizeBrowserFilters(newFilters);
}

export function selectBrowserFilterValues(
	currentFilters: BrowserFilter[],
	target: BrowserFilter,
	selectedValues: string[],
): BrowserFilter[] {
	const index = currentFilters.findIndex((filter) => filter.tag === target.tag);
	if (index < 0) {
		throw new Error(
			`The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
		);
	}
	const newFilters = currentFilters.map((filter, i) =>
		i === index
			? create(BrowserFilterSchema, {
					tag: filter.tag,
					order: filter.order,
					selectedOrder: filter.selectedOrder,
					selectedValues: selectedValues.map((value) =>
						create(Song_MetadataValueSchema, {
							value: {
								case: "stringValue",
								value: {
									value,
								},
							},
						}),
					),
				})
			: filter,
	);
	return normalizeBrowserFilters(newFilters);
}

export function resetAllBrowserFilters(
	currentFilters: BrowserFilter[],
): BrowserFilter[] {
	const newFilters = currentFilters.map((filter) =>
		create(BrowserFilterSchema, {
			tag: filter.tag,
			order: filter.order,
			selectedOrder: filter.selectedOrder,
			selectedValues: [],
		}),
	);
	return normalizeBrowserFilters(newFilters);
}

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
