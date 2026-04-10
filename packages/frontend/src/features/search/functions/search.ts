import { clone, create, toJsonString } from "@bufbuild/protobuf";
import {
	convertSongMetadataValueToString,
	convertStringToSongMetadataValue,
} from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type FilterCondition,
	FilterCondition_Operator,
	FilterConditionSchema,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Query, Search } from "@sola_mpd/shared/src/models/search_pb.js";
import {
	QuerySchema,
	SearchSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import {
	type Song,
	Song_MetadataTag,
	Song_MetadataValueSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import type { SongTableColumn } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { v4 as uuidv4 } from "uuid";
import type { MpdClient } from "../../mpd";
import {
	convertDisplayNameToOperator,
	convertOperatorToDisplayName,
	filterSongsByAndConditions,
} from "../../song_filter";
import {
	convertSongMetadataTagFromDisplayName,
	convertSongMetadataTagToDisplayName,
} from "../../song_table";
import type {
	ConditionFormValues,
	SearchConditions,
	SearchFormValues,
} from "../types/searchTypes";

export function getDefaultSearch(): Search {
	return create(SearchSchema, {
		name: "New Search",
		queries: [getDefaultQuery()],
		columns: [],
	});
}

export function getDefaultQuery(): Query {
	return create(QuerySchema, {
		conditions: [getDefaultCondition()],
	});
}

export function getDefaultCondition(): FilterCondition {
	return create(FilterConditionSchema, {
		uuid: uuidv4(),
		tag: Song_MetadataTag.TITLE,
		operator: FilterCondition_Operator.EQUAL,
		value: create(Song_MetadataValueSchema, {
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
	const newSearch = clone(SearchSchema, search);
	newSearch.name = name;
	return newSearch;
}

export function changeEditingSearchColumns(
	search: Search,
	columns: SongTableColumn[],
): Search {
	const newSearch = clone(SearchSchema, search);
	newSearch.columns = columns;
	return newSearch;
}

export function changeEditingSearchQuery(
	search: Search,
	index: number,
	query: Query,
): Search {
	if (index < 0 || index >= search.queries.length) {
		throw Error("Index out of range to change the search query.");
	}
	const newSearch = clone(SearchSchema, search);
	newSearch.queries[index] = clone(QuerySchema, query);
	return newSearch;
}

export function addEditingSearchQuery(search: Search): Search {
	const newSearch = clone(SearchSchema, search);
	newSearch.queries.push(getDefaultQuery());
	return newSearch;
}

export function removeEditingSearchQuery(
	search: Search,
	index: number,
): Search {
	if (index < 0 || index >= search.queries.length) {
		throw Error("Index out of range to remove the search query.");
	}
	const newSearch = clone(SearchSchema, search);
	newSearch.queries.splice(index, 1);
	return newSearch;
}

export function changeEditingQueryCondition(
	query: Query,
	index: number,
	condition: FilterCondition,
): Query {
	if (index < 0 || index >= query.conditions.length) {
		throw Error("Index out of range to change the query condition.");
	}
	const newQuery = clone(QuerySchema, query);
	newQuery.conditions[index] = clone(FilterConditionSchema, condition);
	return newQuery;
}

export function addEditingQueryCondition(query: Query): Query {
	const newQuery = clone(QuerySchema, query);
	newQuery.conditions.push(getDefaultCondition());
	return newQuery;
}

export function removeEditingQueryCondition(
	query: Query,
	index: number,
): Query {
	if (index < 0 || index >= query.conditions.length) {
		throw Error("Index out of range to remove the query condition.");
	}
	const newQuery = clone(QuerySchema, query);
	newQuery.conditions.splice(index, 1);
	return newQuery;
}

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

export function convertConditionToFormValues(
	condition: FilterCondition,
): ConditionFormValues {
	return {
		uuid: condition.uuid,
		tag: convertSongMetadataTagToDisplayName(condition.tag),
		operator: convertOperatorToDisplayName(condition.operator),
		value:
			condition.value === undefined
				? ""
				: convertSongMetadataValueToString(condition.value),
	};
}

export function convertSearchToFormValues(search: Search): SearchFormValues {
	return {
		name: search.name,
		queries: search.queries.map((query) => ({
			conditions: query.conditions.map(convertConditionToFormValues),
		})),
		columns: search.columns,
	};
}

export function convertFormValuesToSearch(values: SearchFormValues): Search {
	return create(SearchSchema, {
		name: values.name,
		queries: values.queries.map((query) => ({
			conditions: query.conditions.map((condition) => ({
				uuid: condition.uuid,
				tag: convertSongMetadataTagFromDisplayName(condition.tag),
				operator: convertDisplayNameToOperator(condition.operator),
				value: convertStringToSongMetadataValue(condition.value),
			})),
		})),
		columns: values.columns,
	});
}

export async function fetchSearchSongs(
	mpdClient: MpdClient,
	profile: MpdProfile,
	search: Search,
): Promise<Song[]> {
	const searchConditions = convertSearchToConditions(search);

	if (searchConditions.length === 0) {
		return [];
	}

	const songsList = await Promise.all(
		searchConditions.map(async (searchCondition) => {
			let songs: Song[];

			const mpdConditions = searchCondition.mpdConditions;
			if (mpdConditions.length > 0) {
				const res = await mpdClient.command(
					create(MpdRequestSchema, {
						profile,
						command: {
							case: "search",
							value: {
								conditions: mpdConditions,
							},
						},
					}),
				);
				if (res.command.case !== "search") {
					throw Error(
						`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
					);
				}
				songs = res.command.value.songs;
			} else {
				const res = await mpdClient.command(
					create(MpdRequestSchema, {
						profile,
						command: {
							case: "listAllSongs",
							value: {},
						},
					}),
				);
				if (res.command.case !== "listAllSongs") {
					throw Error(
						`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
					);
				}
				songs = res.command.value.songs;
			}

			const nonMpdConditions = searchCondition.nonMpdConditions;
			return filterSongsByAndConditions(songs, nonMpdConditions);
		}),
	);

	return mergeSongsList(songsList);
}
