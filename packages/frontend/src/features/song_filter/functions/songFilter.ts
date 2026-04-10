import { timestampDate } from "@bufbuild/protobuf/wkt";
import {
	convertAudioFormatToString,
	convertSongMetadataValueToString,
} from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type FilterCondition,
	FilterCondition_Operator,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import type {
	Song,
	Song_MetadataValue,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { normalize } from "@sola_mpd/shared/src/utils/stringUtils.js";

type ComparableSongMetadataValue = string | number;
type ComparableConditionValue = string | number | RegExp;

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

export function filterSongsByAndConditions(
	songs: Song[],
	conditions: FilterCondition[],
): Song[] {
	let filteredSongs = songs;
	// As the filter condition include a regex, the loop is based around the filter condition to reduce the number of regex compilations.
	for (const condition of conditions) {
		const conditionValue = convertFilterConditionToComparableValue(condition);

		filteredSongs = filteredSongs.filter((v) => {
			const metadataValue = v.metadata[condition.tag];
			const songValue =
				metadataValue !== undefined
					? convertSongMetadataValueToComparableValue(metadataValue)
					: undefined;
			return matchesFilteringCondition(
				songValue,
				conditionValue,
				condition.operator,
			);
		});
	}
	return filteredSongs;
}
