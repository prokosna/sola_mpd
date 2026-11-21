import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import {
	buildSearchConditions,
	type SimpleFilter,
} from "../functions/buildSearchConditions.js";
import {
	mapSortKeyToMetadataTag,
	type SearchSortKey,
} from "../functions/mapSortKeyToMetadataTag.js";
import {
	type SearchableTagName,
	tagNameToMetadataTag,
} from "../functions/tagNameToMetadataTag.js";
import { resolveCurrentMpdProfile } from "./currentMpdProfile.js";
import {
	executeMpdCommand,
	UnexpectedMpdResponseError,
} from "./mpdCommandHelpers.js";

type SearchDeps = {
	mpdClient: MpdClient;
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
	profileName?: string;
};

export class SearchFilterRequiredError extends Error {
	constructor() {
		super(
			"library_search requires at least one filter key. Use library_query_sql for unfiltered analytical queries.",
		);
		this.name = "SearchFilterRequiredError";
	}
}

export async function listTagValuesUseCase(
	input: {
		tag: SearchableTagName;
		filter?: SimpleFilter;
		limit: number;
	} & SearchDeps,
): Promise<{ total: number; values: string[] }> {
	const profile = resolveCurrentMpdProfile(
		input.mpdProfileStateRepository,
		input.profileName,
	);
	const conditions = input.filter ? buildSearchConditions(input.filter) : [];
	const res = await executeMpdCommand(input.mpdClient, profile, {
		case: "list",
		value: { tag: tagNameToMetadataTag(input.tag), conditions },
	});
	if (res.command?.case !== "list") {
		throw new UnexpectedMpdResponseError("list");
	}
	const values = res.command.value.values;
	return { total: values.length, values: values.slice(0, input.limit) };
}

export async function searchLibraryUseCase(
	input: {
		filter: SimpleFilter;
		limit: number;
		offset: number;
		sort?: SearchSortKey;
		sortDescending?: boolean;
	} & SearchDeps,
): Promise<Song[]> {
	const { limit, offset } = input;
	const profile = resolveCurrentMpdProfile(
		input.mpdProfileStateRepository,
		input.profileName,
	);
	const conditions = buildSearchConditions(input.filter);
	if (conditions.length === 0) {
		throw new SearchFilterRequiredError();
	}
	const res = await executeMpdCommand(input.mpdClient, profile, {
		case: "search",
		value: {
			conditions,
			sort: {
				tag: mapSortKeyToMetadataTag(input.sort),
				descending: input.sortDescending ?? false,
			},
			window: { start: offset, end: offset + limit },
		},
	});
	if (res.command?.case !== "search") {
		throw new UnexpectedMpdResponseError("search");
	}
	return res.command.value.songs;
}
