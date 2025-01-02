import { StringValue } from "@bufbuild/protobuf";
import { describe, expect, it } from "vitest";

import {
	FilterCondition,
	FilterCondition_Operator,
} from "../models/filter_pb.js";
import { Song_MetadataTag, Song_MetadataValue } from "../models/song_pb.js";

import {
	convertConditionToString,
	convertConditionsToString,
	convertSongMetadataTagToMpdTag,
	escapeConditionArg,
	escapeExpression,
	escapeRegexString,
} from "./mpdUtils.js";

describe("MpdUtils", () => {
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
			new FilterCondition({
				uuid: "1",
				tag: Song_MetadataTag.TITLE,
				value: new Song_MetadataValue({
					value: {
						case: "stringValue",
						value: new StringValue({ value: "Test Song" }),
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
			new FilterCondition({
				uuid: "1",
				tag: Song_MetadataTag.TITLE,
				value: new Song_MetadataValue({
					value: {
						case: "stringValue",
						value: new StringValue({ value: "Test Song" }),
					},
				}),
				operator: FilterCondition_Operator.EQUAL,
			}),
			new FilterCondition({
				uuid: "2",
				tag: Song_MetadataTag.ARTIST,
				value: new Song_MetadataValue({
					value: {
						case: "stringValue",
						value: new StringValue({ value: "Test Artist" }),
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
		const condition: FilterCondition = new FilterCondition({
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
			value: new Song_MetadataValue({
				value: {
					case: "stringValue",
					value: new StringValue({ value: "Test" }),
				},
			}),
		};

		const equalCondition = new FilterCondition({
			...baseCondition,
			operator: FilterCondition_Operator.EQUAL,
		});
		expect(convertConditionToString(equalCondition)).toBe('title == "Test"');

		const notEqualCondition = new FilterCondition({
			...baseCondition,
			operator: FilterCondition_Operator.NOT_EQUAL,
		});
		expect(convertConditionToString(notEqualCondition)).toBe('title != "Test"');

		const containCondition = new FilterCondition({
			...baseCondition,
			operator: FilterCondition_Operator.CONTAIN,
		});
		expect(convertConditionToString(containCondition)).toBe(
			'title contains "Test"',
		);

		const notContainCondition = new FilterCondition({
			...baseCondition,
			operator: FilterCondition_Operator.NOT_CONTAIN,
		});
		expect(convertConditionToString(notContainCondition)).toBe(
			'!(title contains "Test")',
		);

		const regexCondition = new FilterCondition({
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
});
