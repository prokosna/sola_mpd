import { create } from "@bufbuild/protobuf";
import { StringValueSchema, timestampFromDate } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";

import {
	type FilterCondition,
	FilterCondition_Operator,
	FilterConditionSchema,
} from "../models/filter_pb.js";
import {
	MpdCommand_Database_SearchSortSchema,
	MpdCommand_Database_SearchWindowSchema,
} from "../models/mpd/mpd_command_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
} from "../models/song_pb.js";

import {
	buildSearchSortTokens,
	buildSearchWindowTokens,
	convertConditionsToString,
	convertConditionToString,
	convertSongMetadataTagToMpdSortTag,
	convertSongMetadataTagToMpdTag,
	escapeConditionArg,
	escapeExpression,
	escapeRegexString,
} from "./mpdConverters.js";

describe("mpdConverters", () => {
	it("escapeConditionArg should correctly escape special characters", () => {
		expect(escapeConditionArg('test"value')).toBe('test\\\\"value');
		expect(escapeConditionArg("test'value")).toBe("test\\'value");
		expect(escapeConditionArg(undefined)).toBe("");
	});

	it("escapeExpression should correctly escape backslashes and double quotes", () => {
		expect(escapeExpression("path\\to\\file")).toBe("path\\\\to\\\\file");
		expect(escapeExpression('say "hello"')).toBe('say \\\\"hello\\\\"');
	});

	it("escapeRegexString should correctly escape regex characters", () => {
		expect(escapeRegexString("a[b]c")).toBe("a\\\\\\\\[b\\\\\\\\]c");
	});

	it("convertConditionsToString should correctly convert conditions to string", () => {
		const conditions: FilterCondition[] = [
			create(FilterConditionSchema, {
				uuid: "1",
				tag: Song_MetadataTag.TITLE,
				value: create(Song_MetadataValueSchema, {
					value: {
						case: "stringValue",
						value: create(StringValueSchema, { value: "Test Song" }),
					},
				}),
				operator: FilterCondition_Operator.EQUAL,
			}),
		];
		expect(convertConditionsToString(conditions)).toBe(
			'((title == "Test Song"))',
		);
	});

	it("convertConditionsToString should handle empty conditions array", () => {
		expect(convertConditionsToString([])).toBe("");
	});

	it("convertConditionsToString should handle multiple conditions", () => {
		const conditions: FilterCondition[] = [
			create(FilterConditionSchema, {
				uuid: "1",
				tag: Song_MetadataTag.TITLE,
				value: create(Song_MetadataValueSchema, {
					value: {
						case: "stringValue",
						value: create(StringValueSchema, { value: "Test Song" }),
					},
				}),
				operator: FilterCondition_Operator.EQUAL,
			}),
			create(FilterConditionSchema, {
				uuid: "2",
				tag: Song_MetadataTag.ARTIST,
				value: create(Song_MetadataValueSchema, {
					value: {
						case: "stringValue",
						value: create(StringValueSchema, { value: "Test Artist" }),
					},
				}),
				operator: FilterCondition_Operator.CONTAIN,
			}),
		];
		expect(convertConditionsToString(conditions)).toBe(
			'((title == "Test Song") AND (artist contains "Test Artist"))',
		);
	});

	it("convertConditionToString should throw an error if value is undefined", () => {
		const condition: FilterCondition = create(FilterConditionSchema, {
			uuid: "1",
			tag: Song_MetadataTag.ARTIST,
			value: undefined,
			operator: FilterCondition_Operator.EQUAL,
		});
		expect(() => convertConditionToString(condition)).toThrow(
			"Condition value is undefined",
		);
	});

	it("convertConditionToString should handle all operator types", () => {
		const baseCondition = {
			uuid: "1",
			tag: Song_MetadataTag.TITLE,
			value: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: "Test" }),
				},
			}),
		};

		const equalCondition = create(FilterConditionSchema, {
			...baseCondition,
			operator: FilterCondition_Operator.EQUAL,
		});
		expect(convertConditionToString(equalCondition)).toBe('title == "Test"');

		const notEqualCondition = create(FilterConditionSchema, {
			...baseCondition,
			operator: FilterCondition_Operator.NOT_EQUAL,
		});
		expect(convertConditionToString(notEqualCondition)).toBe('title != "Test"');

		const containCondition = create(FilterConditionSchema, {
			...baseCondition,
			operator: FilterCondition_Operator.CONTAIN,
		});
		expect(convertConditionToString(containCondition)).toBe(
			'title contains "Test"',
		);

		const notContainCondition = create(FilterConditionSchema, {
			...baseCondition,
			operator: FilterCondition_Operator.NOT_CONTAIN,
		});
		expect(convertConditionToString(notContainCondition)).toBe(
			'!(title contains "Test")',
		);

		const regexCondition = create(FilterConditionSchema, {
			...baseCondition,
			operator: FilterCondition_Operator.REGEX,
		});
		expect(convertConditionToString(regexCondition)).toBe('title =~ "Test"');
	});

	it("convertSong_MetadataTagToMpdTag should convert metadata tag to MPD tag", () => {
		expect(convertSongMetadataTagToMpdTag(Song_MetadataTag.ARTIST)).toBe(
			"artist",
		);
		expect(convertSongMetadataTagToMpdTag(Song_MetadataTag.ALBUM_ARTIST)).toBe(
			"albumartist",
		);
	});

	it("escapeRegexString should handle special regex characters", () => {
		expect(escapeRegexString("test-value")).toBe("test\\\\\\\\x2dvalue");
	});

	it("convertConditionToString should emit added-since for ADDED_SINCE operator", () => {
		const date = new Date("2024-03-15T10:30:00.000Z");
		const condition = create(FilterConditionSchema, {
			uuid: "1",
			tag: Song_MetadataTag.ADDED_AT,
			value: create(Song_MetadataValueSchema, {
				value: {
					case: "timestamp",
					value: timestampFromDate(date),
				},
			}),
			operator: FilterCondition_Operator.ADDED_SINCE,
		});
		expect(convertConditionToString(condition)).toBe(
			'added-since "2024-03-15T10:30:00Z"',
		);
	});

	it("convertConditionToString should format added-since timestamps as UTC Z", () => {
		// Non-UTC input must still be emitted in UTC.
		const date = new Date("2024-03-15T19:30:00+09:00");
		const condition = create(FilterConditionSchema, {
			tag: Song_MetadataTag.ADDED_AT,
			value: create(Song_MetadataValueSchema, {
				value: {
					case: "timestamp",
					value: timestampFromDate(date),
				},
			}),
			operator: FilterCondition_Operator.ADDED_SINCE,
		});
		expect(convertConditionToString(condition)).toBe(
			'added-since "2024-03-15T10:30:00Z"',
		);
	});

	it("convertConditionToString should throw if ADDED_SINCE has non-timestamp value", () => {
		const condition = create(FilterConditionSchema, {
			tag: Song_MetadataTag.ADDED_AT,
			value: create(Song_MetadataValueSchema, {
				value: {
					case: "stringValue",
					value: create(StringValueSchema, { value: "foo" }),
				},
			}),
			operator: FilterCondition_Operator.ADDED_SINCE,
		});
		expect(() => convertConditionToString(condition)).toThrow(
			"ADDED_SINCE operator requires a timestamp value",
		);
	});

	it("convertConditionsToString should wrap added-since condition", () => {
		const date = new Date("2024-03-15T10:30:00.000Z");
		const conditions: FilterCondition[] = [
			create(FilterConditionSchema, {
				tag: Song_MetadataTag.ADDED_AT,
				value: create(Song_MetadataValueSchema, {
					value: {
						case: "timestamp",
						value: timestampFromDate(date),
					},
				}),
				operator: FilterCondition_Operator.ADDED_SINCE,
			}),
		];
		expect(convertConditionsToString(conditions)).toBe(
			'((added-since "2024-03-15T10:30:00Z"))',
		);
	});

	it("convertSongMetadataTagToMpdSortTag should map special sort keys", () => {
		expect(
			convertSongMetadataTagToMpdSortTag(Song_MetadataTag.UPDATED_AT),
		).toBe("Last-Modified");
		expect(convertSongMetadataTagToMpdSortTag(Song_MetadataTag.ADDED_AT)).toBe(
			"Added",
		);
		expect(convertSongMetadataTagToMpdSortTag(Song_MetadataTag.ARTIST)).toBe(
			"artist",
		);
		expect(
			convertSongMetadataTagToMpdSortTag(Song_MetadataTag.ALBUM_ARTIST),
		).toBe("albumartist");
	});

	it("buildSearchSortTokens emits ascending or descending tokens", () => {
		expect(
			buildSearchSortTokens(
				create(MpdCommand_Database_SearchSortSchema, {
					tag: Song_MetadataTag.ADDED_AT,
					descending: true,
				}),
			),
		).toEqual(["sort", "-Added"]);
		expect(
			buildSearchSortTokens(
				create(MpdCommand_Database_SearchSortSchema, {
					tag: Song_MetadataTag.UPDATED_AT,
					descending: false,
				}),
			),
		).toEqual(["sort", "Last-Modified"]);
	});

	it("buildSearchSortTokens returns empty when sort is unset or UNKNOWN", () => {
		expect(buildSearchSortTokens(undefined)).toEqual([]);
		expect(
			buildSearchSortTokens(
				create(MpdCommand_Database_SearchSortSchema, {
					tag: Song_MetadataTag.UNKNOWN,
				}),
			),
		).toEqual([]);
	});

	it("buildSearchWindowTokens emits bounded and unbounded windows", () => {
		expect(
			buildSearchWindowTokens(
				create(MpdCommand_Database_SearchWindowSchema, {
					start: 100,
					end: 200,
				}),
			),
		).toEqual(["window", "100:200"]);
		expect(
			buildSearchWindowTokens(
				create(MpdCommand_Database_SearchWindowSchema, {
					start: 100,
					end: 0,
				}),
			),
		).toEqual(["window", "100:"]);
	});

	it("buildSearchWindowTokens returns empty when window is unset or zero", () => {
		expect(buildSearchWindowTokens(undefined)).toEqual([]);
		expect(
			buildSearchWindowTokens(
				create(MpdCommand_Database_SearchWindowSchema, {
					start: 0,
					end: 0,
				}),
			),
		).toEqual([]);
	});
});
