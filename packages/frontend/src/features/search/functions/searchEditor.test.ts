import { FilterCondition_Operator } from "@sola_mpd/shared/src/models/filter_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it } from "vitest";

import {
	convertOperatorToDisplayName,
	listAllFilterConditionOperators,
} from "../../song_filter";
import { convertSongMetadataTagToDisplayName } from "../../song_table";
import type { ConditionFormValues } from "../types/searchTypes";
import {
	isConditionUnsupportedOnCurrentServer,
	isDateInputTag,
	listAvailableSearchOperators,
	listAvailableSearchTags,
} from "./searchEditor";

function createCondition(
	tag: Song_MetadataTag,
	operator: FilterCondition_Operator,
): ConditionFormValues {
	return {
		uuid: "test-uuid",
		tag: convertSongMetadataTagToDisplayName(tag),
		operator: convertOperatorToDisplayName(operator),
		value: "",
	};
}

describe("searchEditor", () => {
	describe("isDateInputTag", () => {
		it("returns true for UPDATED_AT display name", () => {
			expect(
				isDateInputTag(
					convertSongMetadataTagToDisplayName(Song_MetadataTag.UPDATED_AT),
				),
			).toBe(true);
		});

		it("returns true for ADDED_AT display name", () => {
			expect(
				isDateInputTag(
					convertSongMetadataTagToDisplayName(Song_MetadataTag.ADDED_AT),
				),
			).toBe(true);
		});

		it("returns false for non-date tags", () => {
			expect(
				isDateInputTag(
					convertSongMetadataTagToDisplayName(Song_MetadataTag.TITLE),
				),
			).toBe(false);
			expect(
				isDateInputTag(
					convertSongMetadataTagToDisplayName(Song_MetadataTag.DURATION),
				),
			).toBe(false);
		});

		it("returns false for unknown display name", () => {
			expect(isDateInputTag("Unknown Tag")).toBe(false);
		});
	});

	describe("isConditionUnsupportedOnCurrentServer", () => {
		it("returns false on MPD 0.24+ regardless of condition", () => {
			const cond = createCondition(
				Song_MetadataTag.ADDED_AT,
				FilterCondition_Operator.ADDED_SINCE,
			);
			expect(isConditionUnsupportedOnCurrentServer(cond, true)).toBe(false);
		});

		it("returns true on legacy MPD when tag is ADDED_AT", () => {
			const cond = createCondition(
				Song_MetadataTag.ADDED_AT,
				FilterCondition_Operator.EQUAL,
			);
			expect(isConditionUnsupportedOnCurrentServer(cond, false)).toBe(true);
		});

		it("returns true on legacy MPD when operator is ADDED_SINCE", () => {
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.ADDED_SINCE,
			);
			expect(isConditionUnsupportedOnCurrentServer(cond, false)).toBe(true);
		});

		it("returns false on legacy MPD for unrelated condition", () => {
			const cond = createCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.EQUAL,
			);
			expect(isConditionUnsupportedOnCurrentServer(cond, false)).toBe(false);
		});
	});

	describe("listAvailableSearchTags", () => {
		it("includes ADDED_AT on MPD 0.24+", () => {
			expect(listAvailableSearchTags(true)).toContain(
				Song_MetadataTag.ADDED_AT,
			);
		});

		it("excludes ADDED_AT on legacy MPD", () => {
			expect(listAvailableSearchTags(false)).not.toContain(
				Song_MetadataTag.ADDED_AT,
			);
		});
	});

	describe("listAvailableSearchOperators", () => {
		it("includes ADDED_SINCE on MPD 0.24+", () => {
			expect(listAvailableSearchOperators(true)).toContain(
				FilterCondition_Operator.ADDED_SINCE,
			);
		});

		it("excludes ADDED_SINCE on legacy MPD", () => {
			expect(listAvailableSearchOperators(false)).not.toContain(
				FilterCondition_Operator.ADDED_SINCE,
			);
		});

		it("keeps non-ADDED_SINCE operators on legacy MPD", () => {
			const all = listAllFilterConditionOperators();
			const legacy = listAvailableSearchOperators(false);
			expect(legacy.length).toBe(all.length - 1);
		});
	});
});
