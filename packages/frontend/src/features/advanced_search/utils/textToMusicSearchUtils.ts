import { create, toJsonString } from "@bufbuild/protobuf";
import {
	type AdvancedSearchCommand_TextToMusicType,
	AdvancedSearchRequestSchema,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/domain/src/models/advanced_search_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import type { AdvancedSearchClient } from "../services/AdvancedSearchClient";

export async function searchSongsByText(
	profile: MpdProfile,
	endpoint: string,
	client: AdvancedSearchClient,
	query: string,
	limit: number,
	textToMusicType: AdvancedSearchCommand_TextToMusicType,
): Promise<Song[]> {
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
	if (res.command.case !== "textToMusicSearch") {
		throw Error(
			`Invalid AdvancedSearch response: ${toJsonString(AdvancedSearchResponseSchema, res)}`,
		);
	}
	return res.command.value.songList?.songs ?? [];
}
