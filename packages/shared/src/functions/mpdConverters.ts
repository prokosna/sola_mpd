import { timestampDate } from "@bufbuild/protobuf/wkt";

import {
	type FilterCondition,
	FilterCondition_Operator,
} from "../models/filter_pb.js";
import type {
	MpdCommand_Database_SearchSort,
	MpdCommand_Database_SearchWindow,
} from "../models/mpd/mpd_command_pb.js";
import { Song_MetadataTag } from "../models/song_pb.js";

import { convertSongMetadataValueToString } from "./songMetadata.js";

/**
 * Escapes special characters in a condition argument for MPD filter expressions.
 * Specifically handles escaping of double quotes and single quotes.
 *
 * @param value - The string value to escape, or undefined
 * @returns The escaped string, or an empty string if the input is undefined
 * @example
 * escapeConditionArg('test"value') // returns 'test\\"value'
 * escapeConditionArg("test'value") // returns "test\\'value"
 */
export function escapeConditionArg(value: string | undefined): string {
	return value?.replaceAll('"', '\\\\"').replaceAll("'", "\\'") || "";
}

/**
 * Escapes backslashes and double quotes in an expression for MPD commands.
 *
 * @param value - The string value to escape
 * @returns The escaped string
 * @example
 * escapeExpression("path\\to\\file") // returns "path\\\\to\\\\file"
 * escapeExpression('say "hello"') // returns 'say \\"hello\\"'
 */
export function escapeExpression(value: string): string {
	return value.replaceAll("\\", "\\\\").replaceAll('"', '\\\\"');
}

/**
 * Escapes special regex characters in a string for MPD regex expressions.
 * Handles escaping of regex metacharacters and the hyphen character.
 *
 * @param value - The string value to escape
 * @returns The escaped string safe for use in regex
 * @example
 * escapeRegexString("a[b]c") // returns "a\\\\[b\\\\]c"
 */
export function escapeRegexString(value: string): string {
	return value
		.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
		.replace(/-/g, "\\x2d")
		.replace(/\\/g, "\\\\\\\\");
}

/**
 * Converts an array of filter conditions to an MPD filter expression string.
 * Combines multiple conditions with AND operator.
 *
 * @param conditions - Array of filter conditions to convert
 * @returns The combined filter expression string, or empty string if no conditions
 * @example
 * convertConditionsToString([condition1, condition2]) // returns "((cond1) AND (cond2))"
 */
export function convertConditionsToString(
	conditions: FilterCondition[],
): string {
	if (conditions.length === 0) {
		return "";
	}
	const expression = conditions
		.map((condition) => `(${convertConditionToString(condition)})`)
		.join(" AND ");
	return `(${expression})`;
}

/**
 * Converts a single filter condition to an MPD filter expression string.
 * Supports various operators like EQUAL, NOT_EQUAL, CONTAIN, NOT_CONTAIN, and REGEX.
 *
 * @param condition - The filter condition to convert
 * @returns The filter expression string
 * @throws Error if condition value is undefined
 * @example
 * // For EQUAL operator
 * convertConditionToString(condition) // returns 'title == "Song Name"'
 * // For CONTAIN operator
 * convertConditionToString(condition) // returns 'title contains "Song"'
 */
export function convertConditionToString(condition: FilterCondition): string {
	if (condition.value === undefined) {
		throw new Error("Condition value is undefined");
	}
	if (condition.operator === FilterCondition_Operator.ADDED_SINCE) {
		if (condition.value.value.case !== "timestamp") {
			throw new Error("ADDED_SINCE operator requires a timestamp value");
		}
		const date = timestampDate(condition.value.value.value);
		return `added-since "${date.toISOString()}"`;
	}
	const left = Song_MetadataTag[condition.tag]
		.replaceAll("_", "")
		.toLowerCase();
	const right = escapeConditionArg(
		convertSongMetadataValueToString(condition.value),
	);
	switch (condition.operator) {
		case FilterCondition_Operator.EQUAL:
			return `${left} == "${right}"`;
		case FilterCondition_Operator.NOT_EQUAL:
			return `${left} != "${right}"`;
		case FilterCondition_Operator.CONTAIN:
			return `${left} contains "${right}"`;
		case FilterCondition_Operator.NOT_CONTAIN:
			return `!(${left} contains "${right}")`;
		case FilterCondition_Operator.REGEX:
			return `${left} =~ "${right}"`;
	}
	throw new Error("Unsupported condition operator");
}

/**
 * Converts a Song_MetadataTag to its corresponding MPD tag name.
 * Converts the tag to lowercase and removes underscores.
 *
 * @param tag - The metadata tag to convert
 * @returns The MPD tag name
 * @example
 * convertSongMetadataTagToMpdTag(Song_MetadataTag.ALBUM_ARTIST) // returns "albumartist"
 */
export function convertSongMetadataTagToMpdTag(tag: Song_MetadataTag): string {
	return Song_MetadataTag[tag].toLowerCase().replaceAll("_", "");
}

/**
 * MPD's `sort` clause accepts either a tag name or one of the special keys
 * "Last-Modified" / "Added". Map our enum to those forms; fall back to the
 * lowercase tag form for other tags (MPD's tag parser is case-insensitive).
 */
export function convertSongMetadataTagToMpdSortTag(
	tag: Song_MetadataTag,
): string {
	switch (tag) {
		case Song_MetadataTag.UPDATED_AT:
			return "Last-Modified";
		case Song_MetadataTag.ADDED_AT:
			return "Added";
		default:
			return convertSongMetadataTagToMpdTag(tag);
	}
}

export function buildSearchSortTokens(
	sort: MpdCommand_Database_SearchSort | undefined,
): string[] {
	if (sort === undefined || sort.tag === Song_MetadataTag.UNKNOWN) {
		return [];
	}
	const sortTag = convertSongMetadataTagToMpdSortTag(sort.tag);
	return ["sort", sort.descending ? `-${sortTag}` : sortTag];
}

export function buildSearchWindowTokens(
	window: MpdCommand_Database_SearchWindow | undefined,
): string[] {
	if (window === undefined || (window.start === 0 && window.end === 0)) {
		return [];
	}
	const windowStr =
		window.end > 0 ? `${window.start}:${window.end}` : `${window.start}:`;
	return ["window", windowStr];
}
