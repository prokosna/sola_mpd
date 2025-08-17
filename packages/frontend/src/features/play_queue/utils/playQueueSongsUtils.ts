import { create, toJsonString } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import type { MpdClient } from "../../mpd";

/**
 * Fetches the current play queue contents from the MPD server.
 *
 * This function:
 * 1. Creates a playlistinfo command request
 * 2. Sends the request to the MPD server
 * 3. Validates the response type
 * 4. Extracts the song list from the response
 *
 * Each song in the returned array includes:
 * - Unique ID in the queue
 * - Position in the queue
 * - File path
 * - Metadata (title, artist, album, etc.)
 *
 * @param mpdClient MPD client instance for sending commands
 * @param mpdProfile MPD profile with server connection details
 * @returns Promise resolving to array of queue songs
 * @throws Error if the MPD response is not of type 'playlistinfo'
 */
export async function fetchPlayQueueSongs(
	mpdClient: MpdClient,
	mpdProfile: MpdProfile,
) {
	const req = create(MpdRequestSchema, {
		profile: mpdProfile,
		command: { case: "playlistinfo", value: {} },
	});
	const res = await mpdClient.command(req);
	if (res.command.case !== "playlistinfo") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.songs;
}
