import { timestampDate } from "@bufbuild/protobuf/wkt";
import {
	type FilterCondition,
	FilterCondition_Operator,
} from "@sola_mpd/domain/src/models/filter_pb.js";
import type {
	Song,
	Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import {
	convertAudioFormatToString,
	convertSongMetadataValueToString,
} from "@sola_mpd/domain/src/utils/songUtils.js";
import { normalize } from "@sola_mpd/domain/src/utils/stringUtils.js";

type ComparableSongMetadataValue = string | number;
type ComparableConditionValue = string | number | RegExp;

/**
 * Check if song metadata matches filter condition.
 * @param songMetadataValue Song metadata value
 * @param conditionValue Filter value
 * @param operator Filter operator
 * @returns True if condition is met
 */
function matchesFilteringCondition(
	songMetadataValue: ComparableSongMetadataValue | undefined,
	conditionValue: ComparableConditionValue | undefined,
	operator: FilterCondition_Operator,
): boolean {
	if (songMetadataValue === undefined || conditionValue === undefined) {
		return true;
	}

	switch (operator) {
		case FilterCondition_Operator.EQUAL:
			return songMetadataValue === String(conditionValue);
		case FilterCondition_Operator.NOT_EQUAL:
			return songMetadataValue !== String(conditionValue);
		case FilterCondition_Operator.CONTAIN:
			return String(songMetadataValue).includes(String(conditionValue));
		case FilterCondition_Operator.NOT_CONTAIN:
			return !String(songMetadataValue).includes(String(conditionValue));
		case FilterCondition_Operator.REGEX:
			if (conditionValue instanceof RegExp) {
				return conditionValue.test(String(songMetadataValue));
			}
			return true;
		case FilterCondition_Operator.LESS_THAN:
			if (
				typeof songMetadataValue === "number" &&
				typeof conditionValue === "number"
			) {
				return songMetadataValue < conditionValue;
			}
			return String(songMetadataValue) < String(conditionValue);
		case FilterCondition_Operator.LESS_THAN_OR_EQUAL:
			if (
				typeof songMetadataValue === "number" &&
				typeof conditionValue === "number"
			) {
				return songMetadataValue <= conditionValue;
			}
			return String(songMetadataValue) <= String(conditionValue);
		case FilterCondition_Operator.GREATER_THAN:
			if (
				typeof songMetadataValue === "number" &&
				typeof conditionValue === "number"
			) {
				return songMetadataValue > conditionValue;
			}
			return String(songMetadataValue) > String(conditionValue);
		case FilterCondition_Operator.GREATER_THAN_OR_EQUAL:
			if (
				typeof songMetadataValue === "number" &&
				typeof conditionValue === "number"
			) {
				return songMetadataValue >= conditionValue;
			}
			return String(songMetadataValue) >= String(conditionValue);
		default:
			return true;
	}
}

/**
 * Convert Song_MetadataValue to comparable value.
 * @param value Song metadata value
 * @returns Comparable value or undefined
 */
function convertSongMetadataValueToComparableValue(
	value: Song_MetadataValue,
): ComparableSongMetadataValue | undefined {
	let songMetadataValue: undefined | string | number;
	const raw = value.value;
	switch (raw.case) {
		case "stringValue":
			songMetadataValue = raw.value.value;
			if (songMetadataValue !== undefined) {
				songMetadataValue = normalize(songMetadataValue);
			}
			songMetadataValue = songMetadataValue?.toLowerCase();
			break;
		case "format":
			songMetadataValue = convertAudioFormatToString(raw.value).toLowerCase();
			break;
		case "intValue":
			songMetadataValue = raw.value.value;
			break;
		case "floatValue":
			songMetadataValue = raw.value.value;
			break;
		case "timestamp":
			songMetadataValue = timestampDate(raw.value).getTime();
			break;
	}
	return songMetadataValue;
}

/**
 * Convert FilterCondition to comparable value.
 * @param condition Filter condition
 * @returns Comparable value or undefined
 */
function convertFilterConditionToComparableValue(
	condition: FilterCondition,
): ComparableConditionValue | undefined {
	let conditionValue: undefined | number | string | RegExp;
	switch (condition.value?.value.case) {
		case "stringValue":
			conditionValue = condition.value.value.value.value;
			if (conditionValue !== undefined) {
				conditionValue = normalize(conditionValue);
			}
			conditionValue = conditionValue?.toLowerCase();
			break;
		case "format":
			conditionValue = convertSongMetadataValueToString(
				condition.value,
			).toLowerCase();
			break;
		case "intValue":
			conditionValue = condition.value.value.value.value;
			break;
		case "floatValue":
			conditionValue = condition.value.value.value.value;
			break;
		case "timestamp":
			conditionValue = timestampDate(condition.value.value.value).getTime();
			break;
	}
	if (
		condition.operator === FilterCondition_Operator.REGEX &&
		conditionValue !== undefined
	) {
		conditionValue = new RegExp(String(conditionValue));
	}
	return conditionValue;
}

/**
 * Filter songs using AND conditions.
 * @param songs Songs to filter
 * @param conditions Filter conditions
 * @returns Filtered songs
 */
export function filterSongsByAndConditions(
	songs: Song[],
	conditions: FilterCondition[],
): Song[] {
	let filteredSongs = songs;
	//As the filter condition include a regex, the loop is based around the filter condition to reduce the number of regex compilations.
	for (const condition of conditions) {
		// This possibly compiles a regex.
		const conditionValue = convertFilterConditionToComparableValue(condition);

		// Filter out songs by this condition
		filteredSongs = filteredSongs.filter((v) => {
			const songValue = convertSongMetadataValueToComparableValue(
				v.metadata[condition.tag],
			);
			return matchesFilteringCondition(
				songValue,
				conditionValue,
				condition.operator,
			);
		});
	}
	return filteredSongs;
}

/**
 * Get operator display name.
 * @param operator Filter operator
 * @returns Display name
 */
export function convertOperatorToDisplayName(
	operator: FilterCondition_Operator,
): string {
	switch (operator) {
		case FilterCondition_Operator.UNKNOWN:
			return "unknown";
		case FilterCondition_Operator.EQUAL:
			return "=";
		case FilterCondition_Operator.NOT_EQUAL:
			return "!=";
		case FilterCondition_Operator.CONTAIN:
			return "has";
		case FilterCondition_Operator.NOT_CONTAIN:
			return "!has";
		case FilterCondition_Operator.REGEX:
			return "=~";
		case FilterCondition_Operator.LESS_THAN:
			return "<";
		case FilterCondition_Operator.LESS_THAN_OR_EQUAL:
			return "<=";
		case FilterCondition_Operator.GREATER_THAN:
			return ">";
		case FilterCondition_Operator.GREATER_THAN_OR_EQUAL:
			return ">=";
	}
}

/**
 * Convert display name to operator.
 * @param str Display name
 * @returns Filter operator
 * @throws If invalid operator name
 */
export function convertDisplayNameToOperator(
	str: string,
): FilterCondition_Operator {
	switch (str) {
		case "unknown":
			return FilterCondition_Operator.UNKNOWN;
		case "=":
			return FilterCondition_Operator.EQUAL;
		case "!=":
			return FilterCondition_Operator.NOT_EQUAL;
		case "has":
			return FilterCondition_Operator.CONTAIN;
		case "!has":
			return FilterCondition_Operator.NOT_CONTAIN;
		case "=~":
			return FilterCondition_Operator.REGEX;
		case "<":
			return FilterCondition_Operator.LESS_THAN;
		case "<=":
			return FilterCondition_Operator.LESS_THAN_OR_EQUAL;
		case ">":
			return FilterCondition_Operator.GREATER_THAN;
		case ">=":
			return FilterCondition_Operator.GREATER_THAN_OR_EQUAL;
		default:
			throw new Error(`Not supported operator: ${str}`);
	}
}

/**
 * List all filter operators.
 * @returns Filter operators excluding UNKNOWN
 */
export function listAllFilterConditionOperators(): FilterCondition_Operator[] {
	return Object.keys(FilterCondition_Operator)
		.filter((v) => Number.isNaN(Number(v)))
		.map(
			(v) =>
				FilterCondition_Operator[v as keyof typeof FilterCondition_Operator],
		)
		.filter((v) => v !== FilterCondition_Operator.UNKNOWN);
}
