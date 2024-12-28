import {
  FilterCondition,
  FilterCondition_Operator,
} from "@sola_mpd/domain/src/models/filter_pb.js";
import { Query, Search } from "@sola_mpd/domain/src/models/search_pb.js";
import {
  Song,
  Song_MetadataTag,
  Song_MetadataValue,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";

import { SearchConditions } from "../types/searchTypes";

/**
 * Creates and returns a default Search object.
 * The default search includes a new search name and a single default query.
 * @returns A new Search object with default values.
 */
export function getDefaultSearch(): Search {
  return new Search({
    name: "New Search",
    queries: [getDefaultQuery()],
    columns: [],
  });
}

/**
 * Creates and returns a default Query object.
 * The default query includes a single default condition.
 * @returns A new Query object with default values.
 */
export function getDefaultQuery(): Query {
  return new Query({
    conditions: [getDefaultCondition()],
  });
}

/**
 * Creates and returns a default FilterCondition object.
 * The default condition is set to filter for the TITLE tag with an EQUAL operator
 * and an empty string value.
 * @returns A new FilterCondition object with default values.
 */
export function getDefaultCondition(): FilterCondition {
  return new FilterCondition({
    uuid: crypto.randomUUID(),
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
 * Lists all song metadata tags that are supported for search functionality.
 * This function returns an array of Song_MetadataTag enum values representing
 * various attributes of a song that can be used in search operations.
 *
 * @returns An array of Song_MetadataTag enum values.
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
 * Merges multiple arrays of songs into a single array, removing duplicates.
 * Songs are considered duplicates if they have the same path.
 *
 * @param songsList - An array of Song arrays to be merged
 * @returns A single array of unique Song objects
 */
export function mergeSongsList(songsList: Song[][]): Song[] {
  const all: [string, Song][] = songsList
    .flat()
    .map((song) => [song.path, song]);
  const unique = Array.from(new Map(all).values());
  return unique;
}

/**
 * Converts a Search object into an array of SearchConditions.
 * This function separates the search conditions into MPD-supported and non-MPD-supported conditions.
 *
 * @param search - The Search object to convert
 * @returns An array of SearchConditions, each containing mpdConditions and nonMpdConditions
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
 * Creates a new Search object with an updated name.
 * @param search - The original Search object
 * @param name - The new name for the search
 * @returns A new Search object with the updated name
 */
export function changeEditingSearchName(search: Search, name: string): Search {
  const newSearch = search.clone();
  newSearch.name = name;
  return newSearch;
}

/**
 * Creates a new Search object with updated columns.
 * @param search - The original Search object
 * @param columns - The new columns for the search
 * @returns A new Search object with the updated columns
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
 * Creates a new Search object with an updated Query at the specified index.
 * @param search - The original Search object
 * @param index - The index of the Query to be updated
 * @param query - The new Query object to replace the existing one
 * @returns A new Search object with the updated Query
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
 * Adds a new default query to the given Search object.
 *
 * @param search - The original Search object
 * @returns A new Search object with an additional default query
 */
export function addEditingSearchQuery(search: Search): Search {
  const newSearch = search.clone();
  newSearch.queries = [...search.queries, getDefaultQuery()];
  return newSearch;
}

/**
 * Removes a query from the given Search object at the specified index.
 *
 * @param search - The original Search object
 * @param index - The index of the query to be removed
 * @returns A new Search object with the specified query removed
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
 * Creates a new Query object with an updated FilterCondition at the specified index.
 * @param query - The original Query object
 * @param index - The index of the FilterCondition to be updated
 * @param condition - The new FilterCondition object to replace the existing one
 * @returns A new Query object with the updated FilterCondition
 * @throws Error if the index is out of range
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
 * Adds a new default condition to the given Query object.
 *
 * @param query - The original Query object
 * @returns A new Query object with an additional default condition
 */
export function addEditingQueryCondition(query: Query): Query {
  const newQuery = query.clone();
  newQuery.conditions = [...query.conditions, getDefaultCondition()];
  return newQuery;
}

/**
 * Removes a condition from the given Query object at the specified index.
 *
 * @param query - The original Query object
 * @param index - The index of the condition to be removed
 * @returns A new Query object with the specified condition removed
 * @throws Error if the index is out of range
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
 * Checks if the given operator is valid for the specified metadata tag.
 *
 * @param tag - The Song_MetadataTag to check
 * @param operator - The FilterCondition_Operator to validate
 * @returns True if the operator is valid for the given tag, false otherwise
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
