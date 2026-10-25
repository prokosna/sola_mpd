import { create, toJsonString } from "@bufbuild/protobuf";
import {
	type AdvancedSearchCommand_TextToMusicType,
	AdvancedSearchRequestSchema,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { AdvancedSearchClient } from "../services/AdvancedSearchClient";

export type TextToMusicSearchResult =
	| { kind: "songs"; songs: Song[] }
	| { kind: "error"; message: string };

export async function searchSongsByText(
	profile: MpdProfile,
	endpoint: string,
	client: AdvancedSearchClient,
	query: string,
	limit: number,
	textToMusicType: AdvancedSearchCommand_TextToMusicType,
): Promise<TextToMusicSearchResult> {
	const req = create(AdvancedSearchRequestSchema, {
		config: {
			endpoint,
			limit,
		},
		command: {
			case: "textToMusicSearch",
			value: {
				profile,
				query,
				textToMusicType,
			},
		},
	});
	const res = await client.command(req);
	if (res.command.case === "error") {
		return { kind: "error", message: res.command.value };
	}
	if (res.command.case !== "textToMusicSearch") {
		throw Error(
			`Invalid AdvancedSearch response: ${toJsonString(AdvancedSearchResponseSchema, res)}`,
		);
	}
	return { kind: "songs", songs: res.command.value.songList?.songs ?? [] };
}
