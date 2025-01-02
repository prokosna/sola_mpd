import {
	FilterCondition,
	FilterCondition_Operator,
} from "@sola_mpd/domain/src/models/filter_pb.js";
import { Query, Search } from "@sola_mpd/domain/src/models/search_pb.js";
import {
	type Song,
	Song_MetadataTag,
	Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";

import { v4 as uuidv4 } from "uuid";
import type { SearchConditions } from "../types/searchTypes";

/**
 * Create default Search object.
 *
 * @returns New Search with default values
 */
export function getDefaultSearch(): Search {
	return new Search({
		name: "New Search",
		queries: [getDefaultQuery()],
		columns: [],
	});
}

/**
 * Create default Query object.
 *
 * @returns New Query with default values
 */
export function getDefaultQuery(): Query {
	return new Query({
		conditions: [getDefaultCondition()],
	});
}

/**
 * Create default FilterCondition object.
 *
 * @returns New FilterCondition with default values
 */
export function getDefaultCondition(): FilterCondition {
	return new FilterCondition({
		uuid: uuidv4(),
		tag: Song_MetadataTag.TITLE,
		operator: FilterCondition_Operator.EQUAL,
		value: new Song_MetadataValue({
			value: {
				case: "stringValue",
				value: { value: "" },
			},
		}),
	});
}

/**
 * List supported song metadata tags.
 *
 * @returns Array of metadata tags
 */
export function listSearchSongMetadataTags(): Song_MetadataTag[] {
	return [
		Song_MetadataTag.TITLE,
		Song_MetadataTag.ALBUM_ARTIST,
		Song_MetadataTag.ARTIST,
		Song_MetadataTag.ALBUM,
		Song_MetadataTag.COMPOSER,
		Song_MetadataTag.GENRE,
		Song_MetadataTag.LABEL,
		Song_MetadataTag.DATE,
		Song_MetadataTag.DURATION,
		Song_MetadataTag.TRACK,
		Song_MetadataTag.DISC,
		Song_MetadataTag.UPDATED_AT,
	];
}

/**
 * Merge song arrays, removing duplicates by path.
 *
 * @param songsList Arrays to merge
 * @returns Merged unique songs
 */
export function mergeSongsList(songsList: Song[][]): Song[] {
	const all: [string, Song][] = songsList
		.flat()
		.map((song) => [song.path, song]);
	const unique = Array.from(new Map(all).values());
	return unique;
}

/**
 * Convert Search to SearchConditions.
 *
 * Separates MPD and non-MPD conditions.
 *
 * @param search Search to convert
 * @returns Array of conditions
 */
export function convertSearchToConditions(search: Search): SearchConditions[] {
	return search.queries
		.map((query): SearchConditions => {
			const mpdConditions: FilterCondition[] = [];
			const nonMpdConditions: FilterCondition[] = [];
			for (const condition of query.conditions) {
				if (condition.value === undefined) {
					continue;
				}
				if (
					[
						FilterCondition_Operator.CONTAIN,
						FilterCondition_Operator.EQUAL,
						FilterCondition_Operator.NOT_CONTAIN,
						FilterCondition_Operator.NOT_EQUAL,
						FilterCondition_Operator.REGEX,
					].includes(condition.operator)
				) {
					mpdConditions.push(condition);
				} else {
					nonMpdConditions.push(condition);
				}
			}
			return {
				mpdConditions,
				nonMpdConditions,
			};
		})
		.filter((v: SearchConditions) => {
			return v.mpdConditions.length + v.nonMpdConditions.length > 0;
		});
}

/**
 * Update search name.
 *
 * @param search Original search
 * @param name New name
 * @returns Updated search
 */
export function changeEditingSearchName(search: Search, name: string): Search {
	const newSearch = search.clone();
	newSearch.name = name;
	return newSearch;
}

/**
 * Update search columns.
 *
 * @param search Original search
 * @param columns New columns
 * @returns Updated search
 */
export function changeEditingSearchColumns(
	search: Search,
	columns: SongTableColumn[],
): Search {
	const newSearch = search.clone();
	newSearch.columns = columns;
	return newSearch;
}

/**
 * Update query in search.
 *
 * @param search Original search
 * @param index Query index
 * @param query New query
 * @returns Updated search
 */
export function changeEditingSearchQuery(
	search: Search,
	index: number,
	query: Query,
): Search {
	if (index < 0 || index >= search.queries.length) {
		throw Error("Index out of range to change the search query.");
	}
	const newSearch = search.clone();
	const newQueries = [...search.queries];
	newQueries[index] = query.clone();
	newSearch.queries = newQueries;
	return newSearch;
}

/**
 * Add default query to search.
 *
 * @param search Original search
 * @returns Updated search
 */
export function addEditingSearchQuery(search: Search): Search {
	const newSearch = search.clone();
	newSearch.queries = [...search.queries, getDefaultQuery()];
	return newSearch;
}

/**
 * Remove query from search.
 *
 * @param search Original search
 * @param index Query index
 * @returns Updated search
 */
export function removeEditingSearchQuery(
	search: Search,
	index: number,
): Search {
	if (index < 0 || index >= search.queries.length) {
		throw Error("Index out of range to remove the search query.");
	}
	const newSearch = search.clone();
	const newQueries = [...search.queries];
	newQueries.splice(index, 1);
	newSearch.queries = newQueries;
	return newSearch;
}

/**
 * Update condition in query.
 *
 * @param query Original query
 * @param index Condition index
 * @param condition New condition
 * @returns Updated query
 * @throws If index invalid
 */
export function changeEditingQueryCondition(
	query: Query,
	index: number,
	condition: FilterCondition,
): Query {
	if (index < 0 || index >= query.conditions.length) {
		throw Error("Index out of range to change the query condition.");
	}
	const newQuery = query.clone();
	const newConditions = [...query.conditions];
	newConditions[index] = condition.clone();
	newQuery.conditions = newConditions;
	return newQuery;
}

/**
 * Add default condition to query.
 *
 * @param query Original query
 * @returns Updated query
 */
export function addEditingQueryCondition(query: Query): Query {
	const newQuery = query.clone();
	newQuery.conditions = [...query.conditions, getDefaultCondition()];
	return newQuery;
}

/**
 * Remove condition from query.
 *
 * @param query Original query
 * @param index Condition index
 * @returns Updated query
 * @throws If index invalid
 */
export function removeEditingQueryCondition(
	query: Query,
	index: number,
): Query {
	if (index < 0 || index >= query.conditions.length) {
		throw Error("Index out of range to remove the query condition.");
	}
	const newQuery = query.clone();
	const newConditions = [...query.conditions];
	newConditions.splice(index, 1);
	newQuery.conditions = newConditions;
	return newQuery;
}

/**
 * Check if operator valid for tag.
 *
 * @param tag Metadata tag
 * @param operator Filter operator
 * @returns True if valid
 */
export function isValidOperatorWithMetadataTag(
	tag: Song_MetadataTag,
	operator: FilterCondition_Operator,
): boolean {
	if (![Song_MetadataTag.DURATION, Song_MetadataTag.UPDATED_AT].includes(tag)) {
		return true;
	}
	if (
		[
			FilterCondition_Operator.CONTAIN,
			FilterCondition_Operator.EQUAL,
			FilterCondition_Operator.NOT_CONTAIN,
			FilterCondition_Operator.NOT_EQUAL,
			FilterCondition_Operator.REGEX,
		].includes(operator)
	) {
		return false;
	}
	return true;
}
