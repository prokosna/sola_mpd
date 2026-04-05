import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	type BrowserFilter,
	BrowserFilterSchema,
} from "@sola_mpd/shared/src/models/browser_pb.js";
import { FilterCondition_Operator } from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import {
	addBrowserFilterNext,
	changeBrowserFilterToTheOtherTag,
	convertBrowserFilterToCondition,
	listBrowserSongMetadataTags,
	removeBrowserFilter,
	resetAllBrowserFilters,
	selectBrowserFilterValues,
} from "./browserFilter";

function createMetadataValue(str: string) {
	return create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value: str }),
		},
	});
}

function createFilter(
	tag: Song_MetadataTag,
	order: number,
	selectedOrder: number,
	selectedValues: string[] = [],
): BrowserFilter {
	return create(BrowserFilterSchema, {
		tag,
		order,
		selectedOrder,
		selectedValues: selectedValues.map(createMetadataValue),
	});
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

	describe("convertBrowserFilterToCondition", () => {
		it("should return undefined when no values are selected", () => {
			const filter = createFilter(Song_MetadataTag.ARTIST, 0, -1);
			expect(convertBrowserFilterToCondition(filter)).toBeUndefined();
		});

		it("should return EQUAL condition for single selected value", () => {
			const filter = createFilter(Song_MetadataTag.ARTIST, 0, 1, ["Beatles"]);
			const condition = convertBrowserFilterToCondition(filter);
			expect(condition).toBeDefined();
			expect(condition?.tag).toBe(Song_MetadataTag.ARTIST);
			expect(condition?.operator).toBe(FilterCondition_Operator.EQUAL);
		});

		it("should return REGEX condition for multiple selected values", () => {
			const filter = createFilter(Song_MetadataTag.GENRE, 0, 1, [
				"Rock",
				"Jazz",
			]);
			const condition = convertBrowserFilterToCondition(filter);
			expect(condition).toBeDefined();
			expect(condition?.tag).toBe(Song_MetadataTag.GENRE);
			expect(condition?.operator).toBe(FilterCondition_Operator.REGEX);
		});
	});

	describe("changeBrowserFilterToTheOtherTag", () => {
		it("should change filter tag and clear selection", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST, 0, 1, ["Beatles"]),
				createFilter(Song_MetadataTag.ALBUM, 1, -1),
			];
			const result = changeBrowserFilterToTheOtherTag(
				filters,
				filters[0],
				Song_MetadataTag.GENRE,
			);
			expect(result[0].tag).toBe(Song_MetadataTag.GENRE);
			expect(result[0].selectedValues).toHaveLength(0);
			expect(result[0].selectedOrder).toBe(-1);
			expect(filters[0].tag).toBe(Song_MetadataTag.ARTIST);
			expect(filters[0].selectedValues).toHaveLength(1);
		});

		it("should throw when target filter does not exist", () => {
			const filters = [createFilter(Song_MetadataTag.ARTIST, 0, -1)];
			const nonExistent = createFilter(Song_MetadataTag.GENRE, 0, -1);
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
				createFilter(Song_MetadataTag.ARTIST, 0, -1),
				createFilter(Song_MetadataTag.ALBUM, 1, -1),
			];
			const result = addBrowserFilterNext(
				filters,
				filters[0],
				Song_MetadataTag.GENRE,
			);
			expect(result).toHaveLength(3);
			expect(result[0].tag).toBe(Song_MetadataTag.ARTIST);
			expect(result[1].tag).toBe(Song_MetadataTag.GENRE);
			expect(result[2].tag).toBe(Song_MetadataTag.ALBUM);
			expect(filters).toHaveLength(2);
			expect(filters[1].order).toBe(1);
		});

		it("should throw when target filter does not exist", () => {
			const filters = [createFilter(Song_MetadataTag.ARTIST, 0, -1)];
			const nonExistent = createFilter(Song_MetadataTag.GENRE, 0, -1);
			expect(() =>
				addBrowserFilterNext(filters, nonExistent, Song_MetadataTag.ALBUM),
			).toThrow();
		});
	});

	describe("removeBrowserFilter", () => {
		it("should remove the target filter and normalize orders", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST, 0, -1),
				createFilter(Song_MetadataTag.ALBUM, 1, -1),
				createFilter(Song_MetadataTag.GENRE, 2, -1),
			];
			const result = removeBrowserFilter(filters, filters[1]);
			expect(result).toHaveLength(2);
			expect(result[0].tag).toBe(Song_MetadataTag.ARTIST);
			expect(result[0].order).toBe(0);
			expect(result[1].tag).toBe(Song_MetadataTag.GENRE);
			expect(result[1].order).toBe(1);
			expect(filters).toHaveLength(3);
			expect(filters[2].order).toBe(2);
		});

		it("should throw when target filter does not exist", () => {
			const filters = [createFilter(Song_MetadataTag.ARTIST, 0, -1)];
			const nonExistent = createFilter(Song_MetadataTag.GENRE, 0, -1);
			expect(() => removeBrowserFilter(filters, nonExistent)).toThrow();
		});
	});

	describe("selectBrowserFilterValues", () => {
		it("should set selected values and update selectedOrder", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST, 0, -1),
				createFilter(Song_MetadataTag.ALBUM, 1, -1),
			];
			const result = selectBrowserFilterValues(filters, filters[0], [
				"Beatles",
			]);
			expect(result[0].selectedValues).toHaveLength(1);
			expect(result[0].selectedOrder).toBeGreaterThan(0);
			expect(filters[0].selectedValues).toHaveLength(0);
			expect(filters[0].selectedOrder).toBe(-1);
		});

		it("should clear selectedOrder when selecting empty values", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST, 0, 1, ["Beatles"]),
			];
			const result = selectBrowserFilterValues(filters, filters[0], []);
			expect(result[0].selectedValues).toHaveLength(0);
			expect(result[0].selectedOrder).toBe(-1);
		});

		it("should throw when target filter does not exist", () => {
			const filters = [createFilter(Song_MetadataTag.ARTIST, 0, -1)];
			const nonExistent = createFilter(Song_MetadataTag.GENRE, 0, -1);
			expect(() =>
				selectBrowserFilterValues(filters, nonExistent, ["test"]),
			).toThrow();
		});
	});

	describe("resetAllBrowserFilters", () => {
		it("should clear all selections", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST, 0, 1, ["Beatles"]),
				createFilter(Song_MetadataTag.ALBUM, 1, 2, ["Abbey Road"]),
			];
			const result = resetAllBrowserFilters(filters);
			for (const filter of result) {
				expect(filter.selectedValues).toHaveLength(0);
				expect(filter.selectedOrder).toBe(-1);
			}
			expect(filters[0].selectedValues).toHaveLength(1);
			expect(filters[1].selectedValues).toHaveLength(1);
		});

		it("should preserve filter order after reset", () => {
			const filters = [
				createFilter(Song_MetadataTag.ARTIST, 0, 1, ["Beatles"]),
				createFilter(Song_MetadataTag.ALBUM, 1, -1),
			];
			const result = resetAllBrowserFilters(filters);
			expect(result[0].order).toBe(0);
			expect(result[1].order).toBe(1);
		});
	});
});
