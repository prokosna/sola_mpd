import { create, toJsonString } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { escapeRegexString } from "@sola_mpd/shared/src/functions/mpdConverters.js";
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
import { convertSongMetadataTagToDisplayName } from "../../../song_table";
import type { BrowserFilterView } from "../types/browserFilterView";
import type { BrowserSelection } from "../types/browserSelection";

export function listBrowserSongMetadataTags(): Song_MetadataTag[] {
	return [
		Song_MetadataTag.ALBUM,
		Song_MetadataTag.ALBUM_ARTIST,
		Song_MetadataTag.ARTIST,
		Song_MetadataTag.COMPOSER,
		Song_MetadataTag.GENRE,
	];
}

/**
 * The `react-resizable-panels` key includes each panel's id verbatim
 * (`react-resizable-panels:<viewId>:<panelId>...`), so this order and string
 * form must stay byte-identical or every existing user silently loses their
 * saved pane splits.
 */
export function buildBrowserNavigationPanelIds(
	filterTags: Song_MetadataTag[],
): string[] {
	return filterTags.map((tag) => convertSongMetadataTagToDisplayName(tag));
}

export function convertBrowserFilterToCondition(
	tag: Song_MetadataTag,
	selectedValues: string[],
): FilterCondition | undefined {
	if (selectedValues.length === 0) {
		return undefined;
	}

	if (selectedValues.length === 1) {
		return create(FilterConditionSchema, {
			tag,
			value: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: selectedValues[0] }),
				},
			}),
			operator: FilterCondition_Operator.EQUAL,
		});
	}

	const regexValue = `^(${selectedValues.map(escapeRegexString).join("|")})$`;
	return create(FilterConditionSchema, {
		tag,
		value: create(Song_MetadataValueSchema, {
			value: {
				case: "stringValue",
				value: create(StringValueSchema, { value: regexValue }),
			},
		}),
		operator: FilterCondition_Operator.REGEX,
	});
}

function findFilterIndex(
	filters: BrowserFilterView[],
	target: BrowserFilterView,
): number {
	const index = filters.findIndex((filter) => filter.tag === target.tag);
	if (index < 0) {
		throw new Error(
			`The filter doesn't exist: ${Song_MetadataTag[target.tag]}`,
		);
	}
	return index;
}

export function changeBrowserFilterToTheOtherTag(
	currentFilters: BrowserFilterView[],
	target: BrowserFilterView,
	next: Song_MetadataTag,
): BrowserFilterView[] {
	const index = findFilterIndex(currentFilters, target);
	return currentFilters.map((filter, i) =>
		i === index ? { tag: next, selectedValues: [] } : filter,
	);
}

export function addBrowserFilterNext(
	currentFilters: BrowserFilterView[],
	target: BrowserFilterView,
	next: Song_MetadataTag,
): BrowserFilterView[] {
	const index = findFilterIndex(currentFilters, target);
	const newFilters = [...currentFilters];
	newFilters.splice(index + 1, 0, { tag: next, selectedValues: [] });
	return newFilters;
}

export function removeBrowserFilter(
	currentFilters: BrowserFilterView[],
	target: BrowserFilterView,
): BrowserFilterView[] {
	const index = findFilterIndex(currentFilters, target);
	const newFilters = [...currentFilters];
	newFilters.splice(index, 1);
	return newFilters;
}

export function selectBrowserFilterValues(
	currentFilters: BrowserFilterView[],
	target: BrowserFilterView,
	selectedValues: string[],
): BrowserFilterView[] {
	const index = findFilterIndex(currentFilters, target);
	return currentFilters.map((filter, i) =>
		i === index ? { tag: filter.tag, selectedValues } : filter,
	);
}

export function resetAllBrowserFilters(
	currentFilters: BrowserFilterView[],
): BrowserFilterView[] {
	return currentFilters.map((filter) => ({
		tag: filter.tag,
		selectedValues: [],
	}));
}

/** Structural equality of the panel set: same tags, in the same order. */
export function haveBrowserFilterTagsChanged(
	prevTags: Song_MetadataTag[],
	nextTags: Song_MetadataTag[],
): boolean {
	return (
		prevTags.length !== nextTags.length ||
		prevTags.some((tag, index) => tag !== nextTags[index])
	);
}

/**
 * The runtime value a filter panel renders: the workspace's
 * tag list with the URL-derived selection overlaid, in tag-list order.
 */
export function composeBrowserFilterView(
	filterTags: Song_MetadataTag[],
	selection: BrowserSelection,
): BrowserFilterView[] {
	const selectionByTag = new Map(
		selection.map((entry) => [entry.tag, entry.values]),
	);
	return filterTags.map((tag) => ({
		tag,
		selectedValues: selectionByTag.get(tag) ?? [],
	}));
}

/**
 * Preserves each already-selected tag's chronological position — that order
 * is what lets the first-selected panel show unfiltered choices while later
 * ones narrow by what was picked before them — and appends newly selected
 * tags at the end.
 */
export function mergeBrowserSelectionFromViews(
	currentSelection: BrowserSelection,
	views: BrowserFilterView[],
): BrowserSelection {
	const viewByTag = new Map(views.map((view) => [view.tag, view]));

	const preserved: BrowserSelection = [];
	for (const entry of currentSelection) {
		const view = viewByTag.get(entry.tag);
		if (view !== undefined && view.selectedValues.length > 0) {
			preserved.push({ tag: entry.tag, values: view.selectedValues });
		}
	}

	const preservedTags = new Set(preserved.map((entry) => entry.tag));
	const newlySelected = views
		.filter(
			(view) => view.selectedValues.length > 0 && !preservedTags.has(view.tag),
		)
		.map((view) => ({ tag: view.tag, values: view.selectedValues }));

	return [...preserved, ...newlySelected];
}

export function removeBrowserSelectionValue(
	selection: BrowserSelection,
	tag: Song_MetadataTag,
	value: string,
): BrowserSelection {
	const entry = selection.find((candidate) => candidate.tag === tag);
	if (entry === undefined) {
		return selection;
	}
	const values = entry.values.filter((candidate) => candidate !== value);
	return values.length > 0
		? selection.map((candidate) =>
				candidate.tag === tag ? { tag, values } : candidate,
			)
		: selection.filter((candidate) => candidate.tag !== tag);
}

/**
 * Progressive faceting: a panel with no selection is narrowed by every
 * selected panel, the earliest-selected panel is shown unfiltered, and every
 * later one is narrowed only by what was selected before it — chronology
 * comes entirely from `selection`'s order, not from panel display order.
 */
export async function fetchBrowserFilterValues(
	mpdClient: MpdClient,
	profile: MpdProfile,
	filterTags: Song_MetadataTag[],
	selection: BrowserSelection,
	collator: Intl.Collator,
): Promise<Map<Song_MetadataTag, string[]>> {
	const browserFilterValuesPairs: [Song_MetadataTag, string[]][] =
		await Promise.all(
			filterTags.map(async (tag) => {
				const selectedIndex = selection.findIndex((entry) => entry.tag === tag);
				const precedingEntries =
					selectedIndex < 0 ? selection : selection.slice(0, selectedIndex);
				const conditions = precedingEntries
					.map((entry) =>
						convertBrowserFilterToCondition(entry.tag, entry.values),
					)
					.filter(
						(condition): condition is FilterCondition =>
							condition !== undefined,
					);

				const req = create(MpdRequestSchema, {
					profile,
					command: {
						case: "list",
						value: {
							tag,
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
				return [tag, sortedValues];
			}),
		);

	return new Map(browserFilterValuesPairs);
}
