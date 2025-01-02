import type { Folder } from "@sola_mpd/domain/src/models/file_explore_pb.js";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import type { MpdClient } from "../../mpd";

/**
 * Fetches all folders for the file explorer from the MPD server.
 *
 * @param mpdClient - The MPD client instance used to communicate with the server.
 * @param mpdProfile - The MPD profile containing connection details.
 * @returns A promise that resolves to an array of Folder objects.
 * @throws Error if the MPD response is invalid.
 */
export async function fetchFileExploreFolders(
	mpdClient: MpdClient,
	mpdProfile: MpdProfile,
): Promise<Folder[]> {
	const res = await mpdClient.command(
		new MpdRequest({
			profile: mpdProfile,
			command: {
				case: "listAllFolders",
				value: {},
			},
		}),
	);
	if (res.command.case !== "listAllFolders") {
		throw Error(`Invalid MPD response: ${res.toJsonString()}`);
	}
	return res.command.value.folders;
}
