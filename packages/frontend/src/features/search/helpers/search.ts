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
import { v4 as uuidv4 } from "uuid";

import { SearchConditions } from "../types/search";

export function getDefaultSearch(): Search {
  return new Search({
    name: "New Search",
    queries: [getDefaultQuery()],
    columns: [],
  });
}

export function getDefaultQuery(): Query {
  return new Query({
    conditions: [getDefaultCondition()],
  });
}

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

export function mergeSongsList(songsList: Song[][]): Song[] {
  const all: [string, Song][] = songsList
    .flat()
    .map((song) => [song.path, song]);
  const unique = Array.from(new Map(all).values());
  return unique;
}

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

export function changeEditingSearchName(search: Search, name: string): Search {
  const newSearch = search.clone();
  newSearch.name = name;
  return newSearch;
}

export function changeEditingSearchColumns(
  search: Search,
  columns: SongTableColumn[],
): Search {
  const newSearch = search.clone();
  newSearch.columns = columns;
  return newSearch;
}

export function changeEditingSearchQuery(
  search: Search,
  index: number,
  query: Query,
): Search {
  if (index < 0 || index >= search.queries.length) {
    console.warn("Index out of range to change the search query.");
    return search;
  }
  const newSearch = search.clone();
  const newQueries = [...search.queries];
  newQueries[index] = query.clone();
  newSearch.queries = newQueries;
  return newSearch;
}

export function addEditingSearchQuery(search: Search): Search {
  const newSearch = search.clone();
  newSearch.queries = [...search.queries, getDefaultQuery()];
  return newSearch;
}

export function removeEditingSearchQuery(
  search: Search,
  index: number,
): Search {
  if (index < 0 || index >= search.queries.length) {
    console.warn("Index out of range to remove the search query.");
    return search;
  }
  const newSearch = search.clone();
  const newQueries = [...search.queries];
  newQueries.splice(index, 1);
  newSearch.queries = newQueries;
  return newSearch;
}

export function changeEditingQueryCondition(
  query: Query,
  index: number,
  condition: FilterCondition,
): Query {
  if (index < 0 || index >= query.conditions.length) {
    console.warn("Index out of range to change the query condition.");
    return query;
  }
  const newQuery = query.clone();
  const newConditions = [...query.conditions];
  newConditions[index] = condition.clone();
  newQuery.conditions = newConditions;
  return newQuery;
}

export function addEditingQueryCondition(query: Query): Query {
  const newQuery = query.clone();
  newQuery.conditions = [...query.conditions, getDefaultCondition()];
  return newQuery;
}

export function removeEditingQueryCondition(
  query: Query,
  index: number,
): Query {
  if (index < 0 || index >= query.conditions.length) {
    console.warn("Index out of range to remove the query condition.");
    return query;
  }
  const newQuery = query.clone();
  const newConditions = [...query.conditions];
  newConditions.splice(index, 1);
  newQuery.conditions = newConditions;
  return newQuery;
}
