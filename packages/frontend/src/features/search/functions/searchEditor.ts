import { FilterCondition_Operator } from "@sola_mpd/shared/src/models/filter_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";

import {
	convertOperatorToDisplayName,
	listAllFilterConditionOperators,
} from "../../song_filter";
import {
	convertSongMetadataTagFromDisplayName,
	convertSongMetadataTagToDisplayName,
} from "../../song_table";
import type { ConditionFormValues } from "../types/searchTypes";
import { listSearchSongMetadataTags } from "./search";

const DATE_INPUT_TAGS: readonly Song_MetadataTag[] = [
	Song_MetadataTag.UPDATED_AT,
	Song_MetadataTag.ADDED_AT,
];

export function isDateInputTag(tagDisplayName: string): boolean {
	const tag = convertSongMetadataTagFromDisplayName(tagDisplayName);
	return tag !== undefined && DATE_INPUT_TAGS.includes(tag);
}

// ADDED_AT/ADDED_SINCE require MPD 0.24+. The editor still renders saved
// queries authored on a newer server, so we surface a warning instead of
// silently dropping them.
export function isConditionUnsupportedOnCurrentServer(
	condition: ConditionFormValues,
	isMpd024OrLater: boolean,
): boolean {
	if (isMpd024OrLater) {
		return false;
	}
	return (
		condition.tag ===
			convertSongMetadataTagToDisplayName(Song_MetadataTag.ADDED_AT) ||
		condition.operator ===
			convertOperatorToDisplayName(FilterCondition_Operator.ADDED_SINCE)
	);
}

export function listAvailableSearchTags(
	isMpd024OrLater: boolean,
): Song_MetadataTag[] {
	return listSearchSongMetadataTags().filter(
		(tag) => isMpd024OrLater || tag !== Song_MetadataTag.ADDED_AT,
	);
}

export function listAvailableSearchOperators(
	isMpd024OrLater: boolean,
): FilterCondition_Operator[] {
	return listAllFilterConditionOperators().filter(
		(operator) =>
			isMpd024OrLater || operator !== FilterCondition_Operator.ADDED_SINCE,
	);
}
