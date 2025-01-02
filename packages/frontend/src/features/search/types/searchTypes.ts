import type { FilterCondition } from "@sola_mpd/domain/src/models/filter_pb.js";

/**
 * Filter conditions for search.
 *
 * Separates MPD and non-MPD conditions.
 */
export type SearchConditions = {
	mpdConditions: FilterCondition[];
	nonMpdConditions: FilterCondition[];
};

/**
 * Status of search being edited.
 *
 * NOT_SAVED: Changes not saved
 * COLUMNS_UPDATED: Only columns changed
 * SAVED: All changes saved
 */
export enum EditingSearchStatus {
	NOT_SAVED = 0,
	COLUMNS_UPDATED = 1,
	SAVED = 2,
}
