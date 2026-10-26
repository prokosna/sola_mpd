import { create, toJsonString } from "@bufbuild/protobuf";
import {
	type AdvancedSearchCommand_SimilarityType,
	AdvancedSearchRequestSchema,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { AdvancedSearchClient } from "../services/AdvancedSearchClient";

export type SimilaritySearchResult =
	| { kind: "songs"; songs: Song[] }
	| { kind: "error"; message: string };

export async function searchSimilarSongs(
	profile: MpdProfile,
	endpoint: string,
	client: AdvancedSearchClient,
	song: Song,
	limit: number,
	similarityType: AdvancedSearchCommand_SimilarityType,
): Promise<SimilaritySearchResult> {
	const req = create(AdvancedSearchRequestSchema, {
		config: {
			endpoint,
			limit,
		},
		command: {
			case: "similaritySearch",
			value: {
				profile,
				song,
				similarityType,
			},
		},
	});
	const res = await client.command(req);
	if (res.command.case === "error") {
		return { kind: "error", message: res.command.value };
	}
	if (res.command.case !== "similaritySearch") {
		throw Error(
			`Invalid AdvancedSearch response: ${toJsonString(AdvancedSearchResponseSchema, res)}`,
		);
	}
	return { kind: "songs", songs: res.command.value.songList?.songs ?? [] };
}
