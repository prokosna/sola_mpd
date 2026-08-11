import { create } from "@bufbuild/protobuf";
import { TimestampSchema, timestampFromDate } from "@bufbuild/protobuf/wkt";
import { convertStringToSongMetadataValue } from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type FilterCondition,
	FilterCondition_Operator,
	FilterConditionSchema,
} from "@sola_mpd/shared/src/models/filter_pb.js";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";

export type SimpleFilter = {
	artist?: string;
	artist_contains?: string;
	album_artist?: string;
	album?: string;
	album_contains?: string;
	title_contains?: string;
	genre?: string;
	genre_contains?: string;
	composer?: string;
	label?: string;
	date_equals?: string;
	added_since?: string;
	uri_starts_with?: string;
};

function makeCondition(
	tag: Song_MetadataTag,
	operator: FilterCondition_Operator,
	value: string,
): FilterCondition {
	return create(FilterConditionSchema, {
		tag,
		operator,
		value: convertStringToSongMetadataValue(value),
	});
}

/**
 * `added_since` accepts any string `Date.parse` understands; invalid values
 * raise so the caller can surface a clear error rather than silently dropping
 * the clause.
 */
export function buildSearchConditions(filter: SimpleFilter): FilterCondition[] {
	const conditions: FilterCondition[] = [];
	if (filter.artist) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.ARTIST,
				FilterCondition_Operator.EQUAL,
				filter.artist,
			),
		);
	}
	if (filter.artist_contains) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.ARTIST,
				FilterCondition_Operator.CONTAIN,
				filter.artist_contains,
			),
		);
	}
	if (filter.album_artist) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.ALBUM_ARTIST,
				FilterCondition_Operator.EQUAL,
				filter.album_artist,
			),
		);
	}
	if (filter.album) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.ALBUM,
				FilterCondition_Operator.EQUAL,
				filter.album,
			),
		);
	}
	if (filter.album_contains) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.ALBUM,
				FilterCondition_Operator.CONTAIN,
				filter.album_contains,
			),
		);
	}
	if (filter.title_contains) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.TITLE,
				FilterCondition_Operator.CONTAIN,
				filter.title_contains,
			),
		);
	}
	if (filter.genre) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.GENRE,
				FilterCondition_Operator.EQUAL,
				filter.genre,
			),
		);
	}
	if (filter.genre_contains) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.GENRE,
				FilterCondition_Operator.CONTAIN,
				filter.genre_contains,
			),
		);
	}
	if (filter.composer) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.COMPOSER,
				FilterCondition_Operator.EQUAL,
				filter.composer,
			),
		);
	}
	if (filter.label) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.LABEL,
				FilterCondition_Operator.EQUAL,
				filter.label,
			),
		);
	}
	if (filter.date_equals) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.DATE,
				FilterCondition_Operator.EQUAL,
				filter.date_equals,
			),
		);
	}
	if (filter.uri_starts_with) {
		conditions.push(
			makeCondition(
				Song_MetadataTag.UNKNOWN,
				FilterCondition_Operator.CONTAIN,
				filter.uri_starts_with,
			),
		);
	}
	if (filter.added_since) {
		const ms = Date.parse(filter.added_since);
		if (Number.isNaN(ms)) {
			throw new Error(`added_since is not a valid date: ${filter.added_since}`);
		}
		conditions.push(
			create(FilterConditionSchema, {
				tag: Song_MetadataTag.ADDED_AT,
				operator: FilterCondition_Operator.ADDED_SINCE,
				value: create(Song_MetadataValueSchema, {
					value: {
						case: "timestamp",
						value:
							ms >= 0
								? timestampFromDate(new Date(ms))
								: create(TimestampSchema),
					},
				}),
			}),
		);
	}
	return conditions;
}
