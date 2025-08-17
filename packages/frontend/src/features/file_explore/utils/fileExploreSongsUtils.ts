import { create, toJsonString } from "@bufbuild/protobuf";
import type { Folder } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";

/**
 * Fetches songs for the file explorer from the MPD server.
 * @param mpdClient - The MPD client instance used to communicate with the server.
 * @param mpdProfile - The MPD profile containing connection details.
 * @param folder - The folder to fetch songs from.
 * @returns A promise that resolves to an array of Song objects.
 * @throws Error if the MPD response is invalid.
 */
export async function fetchFileExploreSongs(
	mpdClient: MpdClient,
	mpdProfile: MpdProfile,
	folder: Folder,
): Promise<Song[]> {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
			profile: mpdProfile,
			command: {
				case: "listSongsInFolder",
				value: {
					folder,
				},
			},
		}),
	);
	if (res.command.case !== "listSongsInFolder") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.songs;
}
