import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	FilterCondition_Operator,
	FilterConditionSchema,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	type Query,
	QuerySchema,
	type Search,
	SearchSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import {
	addEditingQueryCondition,
	addEditingSearchQuery,
	changeEditingQueryCondition,
	changeEditingSearchColumns,
	changeEditingSearchName,
	changeEditingSearchQuery,
	convertFormValuesToSearch,
	convertSearchToConditions,
	convertSearchToFormValues,
	getDefaultCondition,
	getDefaultQuery,
	getDefaultSearch,
	isValidOperatorWithMetadataTag,
	listSearchSongMetadataTags,
	mergeSongsList,
	removeEditingQueryCondition,
	removeEditingSearchQuery,
} from "./search";

function createCondition(
	tag: Song_MetadataTag,
	operator: FilterCondition_Operator,
	stringValue: string,
) {
	return create(FilterConditionSchema, {
		uuid: "test-uuid",
		tag,
		operator,
		value: create(Song_MetadataValueSchema, {
			value: {
				case: "stringValue",
				value: create(StringValueSchema, { value: stringValue }),
			},
		}),
	});
}

function createQuery(conditions: ReturnType<typeof createCondition>[]): Query {
	return create(QuerySchema, { conditions });
}

function createSearch(queries: Query[]): Search {
	return create(SearchSchema, { name: "Test", queries, columns: [] });
}

describe("search", () => {
	describe("getDefaultSearch", () => {
		it("should return a Search with default values", () => {
			const search = getDefaultSearch();
			expect(search.name).toBe("New Search");
			expect(search.queries).toHaveLength(1);
			expect(search.queries[0].conditions).toHaveLength(1);
			expect(search.columns).toEqual([]);
		});
	});

	describe("getDefaultQuery", () => {
		it("should return a Query with one default condition", () => {
			const query = getDefaultQuery();
			expect(query.conditions).toHaveLength(1);
			expect(query.conditions[0].tag).toBe(Song_MetadataTag.TITLE);
			expect(query.conditions[0].operator).toBe(FilterCondition_Operator.EQUAL);
		});
	});

	describe("getDefaultCondition", () => {
		it("should return a FilterCondition with default values and unique uuid", () => {
			const c1 = getDefaultCondition();
			const c2 = getDefaultCondition();
			expect(c1.uuid).toBeTruthy();
			expect(c1.uuid).not.toBe(c2.uuid);
			expect(c1.tag).toBe(Song_MetadataTag.TITLE);
		});
	});

	describe("listSearchSongMetadataTags", () => {
		it("should return supported metadata tags", () => {
			const tags = listSearchSongMetadataTags();
			expect(tags).toContain(Song_MetadataTag.TITLE);
			expect(tags).toContain(Song_MetadataTag.ALBUM);
			expect(tags).toContain(Song_MetadataTag.DURATION);
			expect(tags).toContain(Song_MetadataTag.ADDED_AT);
			expect(tags.length).toBe(13);
		});
	});

	describe("mergeSongsList", () => {
		it("should merge and deduplicate songs by path", () => {
			const song1 = create(SongSchema, { path: "/a.mp3" });
			const song2 = create(SongSchema, { path: "/b.mp3" });
			const song1dup = create(SongSchema, { path: "/a.mp3" });
			const result = mergeSongsList([[song1, song2], [song1dup]]);
			expect(result).toHaveLength(2);
			expect(result.map((s) => s.path)).toEqual(["/a.mp3", "/b.mp3"]);
		});

		it("should return empty for empty input", () => {
			expect(mergeSongsList([])).toEqual([]);
			expect(mergeSongsList([[]])).toEqual([]);
		});
	});

	describe("convertSearchToConditions", () => {
		it("should separate MPD and non-MPD conditions", () => {
			const mpdCond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				"test",
			);
			const nonMpdCond = createCondition(
				Song_MetadataTag.DURATION,
				FilterCondition_Operator.GREATER_THAN,
				"100",
			);
			const query = createQuery([mpdCond, nonMpdCond]);
			const search = createSearch([query]);

			const result = convertSearchToConditions(search, true);
			expect(result).toHaveLength(1);
			expect(result[0].mpdConditions).toHaveLength(1);
			expect(result[0].nonMpdConditions).toHaveLength(1);
		});

		it("should filter out conditions without value", () => {
			const condNoValue = create(FilterConditionSchema, {
				uuid: "no-val",
				tag: Song_MetadataTag.TITLE,
				operator: FilterCondition_Operator.EQUAL,
			});
			const query = createQuery([condNoValue]);
			const search = createSearch([query]);

			const result = convertSearchToConditions(search, true);
			expect(result).toHaveLength(0);
		});

		it("should handle multiple queries (OR conditions)", () => {
			const c1 = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				"a",
			);
			const c2 = createCondition(
				Song_MetadataTag.ARTIST,
				FilterCondition_Operator.CONTAIN,
				"b",
			);
			const search = createSearch([createQuery([c1]), createQuery([c2])]);

			const result = convertSearchToConditions(search, true);
			expect(result).toHaveLength(2);
		});

		it("routes ADDED_SINCE to mpdConditions when supported", () => {
			const addedSince = createCondition(
				Song_MetadataTag.ADDED_AT,
				FilterCondition_Operator.ADDED_SINCE,
				"2024-03-15",
			);
			const search = createSearch([createQuery([addedSince])]);

			const result = convertSearchToConditions(search, true);
			expect(result).toHaveLength(1);
			expect(result[0].mpdConditions).toHaveLength(1);
			expect(result[0].nonMpdConditions).toHaveLength(0);
		});

		it("drops ADDED_SINCE silently when the server does not support it", () => {
			const addedSince = createCondition(
				Song_MetadataTag.ADDED_AT,
				FilterCondition_Operator.ADDED_SINCE,
				"2024-03-15",
			);
			const other = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				"keep",
			);
			const search = createSearch([createQuery([addedSince, other])]);

			const result = convertSearchToConditions(search, false);
			expect(result).toHaveLength(1);
			expect(result[0].mpdConditions).toHaveLength(1);
			expect(result[0].mpdConditions[0].tag).toBe(Song_MetadataTag.TITLE);
		});
	});

	describe("changeEditingSearchName", () => {
		it("should return a new search with updated name without mutating input", () => {
			const search = createSearch([]);
			const originalName = search.name;
			const result = changeEditingSearchName(search, "New Name");
			expect(result.name).toBe("New Name");
			expect(search.name).toBe(originalName);
		});
	});

	describe("changeEditingSearchColumns", () => {
		it("should return a new search with updated columns", () => {
			const search = createSearch([]);
			const result = changeEditingSearchColumns(search, []);
			expect(result.columns).toEqual([]);
		});
	});

	describe("changeEditingSearchQuery", () => {
		it("should replace query at given index without mutating input", () => {
			const q1 = createQuery([]);
			const q2 = createQuery([]);
			const search = createSearch([q1]);
			const originalLength = search.queries.length;
			const result = changeEditingSearchQuery(search, 0, q2);
			expect(result.queries[0]).toEqual(q2);
			expect(search.queries.length).toBe(originalLength);
		});

		it("should throw for out-of-range index", () => {
			const search = createSearch([createQuery([])]);
			expect(() =>
				changeEditingSearchQuery(search, 5, createQuery([])),
			).toThrow("Index out of range");
			expect(() =>
				changeEditingSearchQuery(search, -1, createQuery([])),
			).toThrow("Index out of range");
		});
	});

	describe("addEditingSearchQuery", () => {
		it("should append a new default query without mutating input", () => {
			const search = createSearch([createQuery([])]);
			const originalLength = search.queries.length;
			const result = addEditingSearchQuery(search);
			expect(result.queries).toHaveLength(2);
			expect(search.queries.length).toBe(originalLength);
		});
	});

	describe("removeEditingSearchQuery", () => {
		it("should remove query at given index without mutating input", () => {
			const q1 = createQuery([]);
			const q2 = createQuery([]);
			const search = createSearch([q1, q2]);
			const originalLength = search.queries.length;
			const result = removeEditingSearchQuery(search, 0);
			expect(result.queries).toHaveLength(1);
			expect(search.queries.length).toBe(originalLength);
		});

		it("should throw for out-of-range index", () => {
			const search = createSearch([createQuery([])]);
			expect(() => removeEditingSearchQuery(search, 3)).toThrow(
				"Index out of range",
			);
		});
	});

	describe("changeEditingQueryCondition", () => {
		it("should replace condition at given index without mutating input", () => {
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				"a",
			);
			const newCond = createCondition(
				Song_MetadataTag.ARTIST,
				FilterCondition_Operator.CONTAIN,
				"b",
			);
			const query = createQuery([cond]);
			const originalTag = query.conditions[0].tag;
			const result = changeEditingQueryCondition(query, 0, newCond);
			expect(result.conditions[0].tag).toBe(Song_MetadataTag.ARTIST);
			expect(query.conditions[0].tag).toBe(originalTag);
		});

		it("should throw for out-of-range index", () => {
			const query = createQuery([]);
			expect(() =>
				changeEditingQueryCondition(
					query,
					0,
					createCondition(
						Song_MetadataTag.TITLE,
						FilterCondition_Operator.EQUAL,
						"",
					),
				),
			).toThrow("Index out of range");
		});
	});

	describe("addEditingQueryCondition", () => {
		it("should append a default condition without mutating input", () => {
			const query = createQuery([]);
			const originalLength = query.conditions.length;
			const result = addEditingQueryCondition(query);
			expect(result.conditions).toHaveLength(1);
			expect(query.conditions.length).toBe(originalLength);
		});
	});

	describe("removeEditingQueryCondition", () => {
		it("should remove condition at given index without mutating input", () => {
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				"a",
			);
			const query = createQuery([cond]);
			const originalLength = query.conditions.length;
			const result = removeEditingQueryCondition(query, 0);
			expect(result.conditions).toHaveLength(0);
			expect(query.conditions.length).toBe(originalLength);
		});

		it("should throw for out-of-range index", () => {
			const query = createQuery([]);
			expect(() => removeEditingQueryCondition(query, 0)).toThrow(
				"Index out of range",
			);
		});
	});

	describe("isValidOperatorWithMetadataTag", () => {
		it("should return true for non-duration/timestamp tags with any operator", () => {
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.TITLE,
					FilterCondition_Operator.CONTAIN,
				),
			).toBe(true);
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.TITLE,
					FilterCondition_Operator.GREATER_THAN,
				),
			).toBe(true);
		});

		it("should return false for DURATION with string operators", () => {
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.DURATION,
					FilterCondition_Operator.CONTAIN,
				),
			).toBe(false);
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.DURATION,
					FilterCondition_Operator.EQUAL,
				),
			).toBe(false);
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.DURATION,
					FilterCondition_Operator.REGEX,
				),
			).toBe(false);
		});

		it("should return true for DURATION with numeric operators", () => {
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.DURATION,
					FilterCondition_Operator.GREATER_THAN,
				),
			).toBe(true);
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.DURATION,
					FilterCondition_Operator.LESS_THAN_OR_EQUAL,
				),
			).toBe(true);
		});

		it("allows ADDED_SINCE only when paired with ADDED_AT", () => {
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.ADDED_AT,
					FilterCondition_Operator.ADDED_SINCE,
				),
			).toBe(true);
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.TITLE,
					FilterCondition_Operator.ADDED_SINCE,
				),
			).toBe(false);
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.UPDATED_AT,
					FilterCondition_Operator.ADDED_SINCE,
				),
			).toBe(false);
		});

		it("rejects all non-ADDED_SINCE operators on ADDED_AT", () => {
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.ADDED_AT,
					FilterCondition_Operator.EQUAL,
				),
			).toBe(false);
			expect(
				isValidOperatorWithMetadataTag(
					Song_MetadataTag.ADDED_AT,
					FilterCondition_Operator.GREATER_THAN,
				),
			).toBe(false);
		});
	});

	describe("convertSearchToFormValues / convertFormValuesToSearch", () => {
		it("should round-trip a search through form values", () => {
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
				"hello",
			);
			const search = create(SearchSchema, {
				name: "My Search",
				queries: [createQuery([cond])],
				columns: [],
			});

			const formValues = convertSearchToFormValues(search);
			expect(formValues.name).toBe("My Search");
			expect(formValues.queries).toHaveLength(1);
			expect(formValues.queries[0].conditions).toHaveLength(1);
			expect(formValues.queries[0].conditions[0].value).toBe("hello");

			const roundTripped = convertFormValuesToSearch(formValues);
			expect(roundTripped.name).toBe("My Search");
			expect(roundTripped.queries).toHaveLength(1);
			expect(roundTripped.queries[0].conditions[0].tag).toBe(
				Song_MetadataTag.TITLE,
			);
			expect(roundTripped.queries[0].conditions[0].operator).toBe(
				FilterCondition_Operator.EQUAL,
			);
		});
	});
});
