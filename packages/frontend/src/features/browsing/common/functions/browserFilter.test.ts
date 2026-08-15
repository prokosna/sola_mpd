import { create } from "@bufbuild/protobuf";
import { FilterCondition_Operator } from "@sola_mpd/shared/src/models/filter_pb.js";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../../mpd";
import type { BrowserFilterView } from "../types/browserFilterView";
import type { BrowserSelection } from "../types/browserSelection";
import {
	addBrowserFilterNext,
	buildBrowserNavigationPanelIds,
	changeBrowserFilterToTheOtherTag,
	composeBrowserFilterView,
	convertBrowserFilterToCondition,
	fetchBrowserFilterValues,
	haveBrowserFilterTagsChanged,
	listBrowserSongMetadataTags,
	mergeBrowserSelectionFromViews,
	removeBrowserFilter,
	removeBrowserSelectionValue,
	resetAllBrowserFilters,
	selectBrowserFilterValues,
} from "./browserFilter";

function createFilter(
	tag: Song_MetadataTag,
	selectedValues: string[] = [],
): BrowserFilterView {
	return { tag, selectedValues };
}

describe("browserFilter", () => {
	describe("listBrowserSongMetadataTags", () => {
		it("should return the supported metadata tags", () => {
			const tags = listBrowserSongMetadataTags();
			expect(tags).toEqual([
				Song_MetadataTag.ALBUM,
				Song_MetadataTag.ALBUM_ARTIST,
				Song_MetadataTag.ARTIST,
				Song_MetadataTag.COMPOSER,
				Song_MetadataTag.GENRE,
			]);
		});
	});

	describe("buildBrowserNavigationPanelIds", () => {
		it("derives one id per tag, in array order — pinned: react-resizable-panels keys its storage on this string and order", () => {
			expect(
				buildBrowserNavigationPanelIds([
					Song_MetadataTag.GENRE,
					Song_MetadataTag.ARTIST,
					Song_MetadataTag.ALBUM,
					Song_MetadataTag.COMPOSER,
				]),
			).toEqual(["Genre", "Artist", "Album", "Composer"]);
		});
	});

	describe("convertBrowserFilterToCondition", () => {
		it("should return undefined when no values are selected", () => {
			expect(
				convertBrowserFilterToCondition(Song_MetadataTag.ARTIST, []),
			).toBeUndefined();
		});

		it("should return EQUAL condition for single selected value", () => {
			const condition = convertBrowserFilterToCondition(
				Song_MetadataTag.ARTIST,
				["Beatles"],
			);
			expect(condition).toBeDefined();
			expect(condition?.tag).toBe(Song_MetadataTag.ARTIST);
			expect(condition?.operator).toBe(FilterCondition_Operator.EQUAL);
		});

		it("should return REGEX condition for multiple selected values", () => {
			const condition = convertBrowserFilterToCondition(
				Song_MetadataTag.GENRE,
				["Rock", "Jazz"],
			);
			expect(condition).toBeDefined();
			expect(condition?.tag).toBe(Song_MetadataTag.GENRE);
			expect(condition?.operator).toBe(FilterCondition_Operator.REGEX);
		});
	});

	describe("changeBrowserFilterToTheOtherTag", () => {
		it("should change filter tag and clear selection", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST, ["Beatles"]),
				createFilter(Song_MetadataTag.ALBUM),
			];
			const result = changeBrowserFilterToTheOtherTag(
				filters,
				filters[0],
				Song_MetadataTag.GENRE,
			);
			expect(result[0].tag).toBe(Song_MetadataTag.GENRE);
			expect(result[0].selectedValues).toHaveLength(0);
			expect(filters[0].tag).toBe(Song_MetadataTag.ARTIST);
			expect(filters[0].selectedValues).toHaveLength(1);
		});

		it("should throw when target filter does not exist", () => {
			const filters = [createFilter(Song_MetadataTag.ARTIST)];
			const nonExistent = createFilter(Song_MetadataTag.GENRE);
			expect(() =>
				changeBrowserFilterToTheOtherTag(
					filters,
					nonExistent,
					Song_MetadataTag.ALBUM,
				),
			).toThrow();
		});
	});

	describe("addBrowserFilterNext", () => {
		it("should add a new filter after the target", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST),
				createFilter(Song_MetadataTag.ALBUM),
			];
			const result = addBrowserFilterNext(
				filters,
				filters[0],
				Song_MetadataTag.GENRE,
			);
			expect(result.map((f) => f.tag)).toEqual([
				Song_MetadataTag.ARTIST,
				Song_MetadataTag.GENRE,
				Song_MetadataTag.ALBUM,
			]);
			expect(filters).toHaveLength(2);
		});

		it("should throw when target filter does not exist", () => {
			const filters = [createFilter(Song_MetadataTag.ARTIST)];
			const nonExistent = createFilter(Song_MetadataTag.GENRE);
			expect(() =>
				addBrowserFilterNext(filters, nonExistent, Song_MetadataTag.ALBUM),
			).toThrow();
		});
	});

	describe("removeBrowserFilter", () => {
		it("should remove the target filter", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST),
				createFilter(Song_MetadataTag.ALBUM),
				createFilter(Song_MetadataTag.GENRE),
			];
			const result = removeBrowserFilter(filters, filters[1]);
			expect(result.map((f) => f.tag)).toEqual([
				Song_MetadataTag.ARTIST,
				Song_MetadataTag.GENRE,
			]);
			expect(filters).toHaveLength(3);
		});

		it("should throw when target filter does not exist", () => {
			const filters = [createFilter(Song_MetadataTag.ARTIST)];
			const nonExistent = createFilter(Song_MetadataTag.GENRE);
			expect(() => removeBrowserFilter(filters, nonExistent)).toThrow();
		});
	});

	describe("selectBrowserFilterValues", () => {
		it("should set selected values on the target filter only", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST),
				createFilter(Song_MetadataTag.ALBUM),
			];
			const result = selectBrowserFilterValues(filters, filters[0], [
				"Beatles",
			]);
			expect(result[0].selectedValues).toEqual(["Beatles"]);
			expect(result[1].selectedValues).toHaveLength(0);
			expect(filters[0].selectedValues).toHaveLength(0);
		});

		it("should throw when target filter does not exist", () => {
			const filters = [createFilter(Song_MetadataTag.ARTIST)];
			const nonExistent = createFilter(Song_MetadataTag.GENRE);
			expect(() =>
				selectBrowserFilterValues(filters, nonExistent, ["test"]),
			).toThrow();
		});
	});

	describe("resetAllBrowserFilters", () => {
		it("should clear all selections while preserving order", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST, ["Beatles"]),
				createFilter(Song_MetadataTag.ALBUM, ["Abbey Road"]),
			];
			const result = resetAllBrowserFilters(filters);
			expect(result.map((f) => f.tag)).toEqual([
				Song_MetadataTag.ARTIST,
				Song_MetadataTag.ALBUM,
			]);
			for (const filter of result) {
				expect(filter.selectedValues).toHaveLength(0);
			}
			expect(filters[0].selectedValues).toHaveLength(1);
		});
	});

	describe("haveBrowserFilterTagsChanged", () => {
		it("returns false for identical tag lists", () => {
			expect(
				haveBrowserFilterTagsChanged(
					[Song_MetadataTag.ARTIST],
					[Song_MetadataTag.ARTIST],
				),
			).toBe(false);
		});

		it("returns true when a tag changes", () => {
			expect(
				haveBrowserFilterTagsChanged(
					[Song_MetadataTag.ARTIST],
					[Song_MetadataTag.GENRE],
				),
			).toBe(true);
		});

		it("returns true when order changes", () => {
			expect(
				haveBrowserFilterTagsChanged(
					[Song_MetadataTag.ARTIST, Song_MetadataTag.ALBUM],
					[Song_MetadataTag.ALBUM, Song_MetadataTag.ARTIST],
				),
			).toBe(true);
		});

		it("returns true when the length differs", () => {
			expect(
				haveBrowserFilterTagsChanged(
					[Song_MetadataTag.ARTIST],
					[Song_MetadataTag.ARTIST, Song_MetadataTag.ALBUM],
				),
			).toBe(true);
		});
	});

	describe("composeBrowserFilterView", () => {
		it("overlays the selection onto the tag list, in tag-list order", () => {
			const selection: BrowserSelection = [
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
			];
			const result = composeBrowserFilterView(
				[Song_MetadataTag.ARTIST, Song_MetadataTag.ALBUM],
				selection,
			);
			expect(result).toEqual([
				{ tag: Song_MetadataTag.ARTIST, selectedValues: [] },
				{ tag: Song_MetadataTag.ALBUM, selectedValues: ["Abbey Road"] },
			]);
		});
	});

	describe("mergeBrowserSelectionFromViews", () => {
		it("keeps an already-selected tag's chronological position when its values change", () => {
			const currentSelection: BrowserSelection = [
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
			];
			const views = [
				createFilter(Song_MetadataTag.ARTIST, ["Beatles", "Wings"]),
				createFilter(Song_MetadataTag.ALBUM, ["Abbey Road"]),
			];
			expect(mergeBrowserSelectionFromViews(currentSelection, views)).toEqual([
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles", "Wings"] },
			]);
		});

		it("appends a newly selected tag as the most recent", () => {
			const currentSelection: BrowserSelection = [
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
			];
			const views = [
				createFilter(Song_MetadataTag.ALBUM, ["Abbey Road"]),
				createFilter(Song_MetadataTag.ARTIST, ["Beatles"]),
			];
			expect(mergeBrowserSelectionFromViews(currentSelection, views)).toEqual([
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
			]);
		});

		it("drops a tag that is no longer selected", () => {
			const currentSelection: BrowserSelection = [
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
			];
			const views = [
				createFilter(Song_MetadataTag.ARTIST, ["Beatles"]),
				createFilter(Song_MetadataTag.ALBUM),
			];
			expect(mergeBrowserSelectionFromViews(currentSelection, views)).toEqual([
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
			]);
		});

		it("drops a tag that is no longer a panel at all", () => {
			const currentSelection: BrowserSelection = [
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
			];
			const views = [createFilter(Song_MetadataTag.GENRE)];
			expect(mergeBrowserSelectionFromViews(currentSelection, views)).toEqual(
				[],
			);
		});
	});

	describe("removeBrowserSelectionValue", () => {
		it("removes one value, keeping the rest and the tag's position", () => {
			const selection: BrowserSelection = [
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles", "Wings"] },
			];
			expect(
				removeBrowserSelectionValue(
					selection,
					Song_MetadataTag.ARTIST,
					"Wings",
				),
			).toEqual([
				{ tag: Song_MetadataTag.ALBUM, values: ["Abbey Road"] },
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
			]);
		});

		it("drops the entry entirely once its last value is removed", () => {
			const selection: BrowserSelection = [
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
			];
			expect(
				removeBrowserSelectionValue(
					selection,
					Song_MetadataTag.ARTIST,
					"Beatles",
				),
			).toEqual([]);
		});

		it("is a no-op when the tag has no selection", () => {
			const selection: BrowserSelection = [];
			expect(
				removeBrowserSelectionValue(selection, Song_MetadataTag.ARTIST, "x"),
			).toBe(selection);
		});
	});

	describe("fetchBrowserFilterValues", () => {
		const profile = create(MpdProfileSchema, {
			name: "test",
			host: "localhost",
			port: 6600,
		});
		const collator = new Intl.Collator("en");

		function createMockMpdClient(): MpdClient {
			return {
				command: vi.fn(async () =>
					create(MpdResponseSchema, {
						command: { case: "list", value: { values: ["b", "a"] } },
					}),
				),
				commandBulk: vi.fn(),
			};
		}

		it("applies no conditions to the earliest-selected panel", async () => {
			const client = createMockMpdClient();
			const selection: BrowserSelection = [
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
			];
			await fetchBrowserFilterValues(
				client,
				profile,
				[Song_MetadataTag.ARTIST],
				selection,
				collator,
			);
			const req = (client.command as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(req.command.value.conditions).toHaveLength(0);
		});

		it("narrows a later-selected panel by everything selected before it, not after", async () => {
			const client = createMockMpdClient();
			const selection: BrowserSelection = [
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
				{ tag: Song_MetadataTag.GENRE, values: ["Rock"] },
			];
			await fetchBrowserFilterValues(
				client,
				profile,
				[Song_MetadataTag.GENRE],
				selection,
				collator,
			);
			const req = (client.command as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(req.command.value.conditions).toHaveLength(1);
			expect(req.command.value.conditions[0].tag).toBe(Song_MetadataTag.ARTIST);
		});

		it("narrows an unselected panel by every selected panel", async () => {
			const client = createMockMpdClient();
			const selection: BrowserSelection = [
				{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
				{ tag: Song_MetadataTag.GENRE, values: ["Rock"] },
			];
			await fetchBrowserFilterValues(
				client,
				profile,
				[Song_MetadataTag.ALBUM],
				selection,
				collator,
			);
			const req = (client.command as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(req.command.value.conditions).toHaveLength(2);
		});

		it("sorts the returned values with the given collator", async () => {
			const client = createMockMpdClient();
			const result = await fetchBrowserFilterValues(
				client,
				profile,
				[Song_MetadataTag.ARTIST],
				[],
				collator,
			);
			expect(result.get(Song_MetadataTag.ARTIST)).toEqual(["a", "b"]);
		});
	});
});
