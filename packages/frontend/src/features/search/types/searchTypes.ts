import type { FilterCondition } from "@sola_mpd/shared/src/models/filter_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";

export type SearchConditions = {
	mpdConditions: FilterCondition[];
	nonMpdConditions: FilterCondition[];
};

export enum EditingSearchStatus {
	NOT_SAVED = 0,
	COLUMNS_UPDATED = 1,
	SAVED = 2,
}

export type ConditionFormValues = {
	uuid: string;
	tag: string;
	operator: string;
	value: string;
};

export type SearchFormValues = {
	name: string;
	queries: {
		conditions: ConditionFormValues[];
	}[];
	columns: SongTableColumn[];
};
