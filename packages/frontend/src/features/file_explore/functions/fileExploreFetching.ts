import { create, toJsonString } from "@bufbuild/protobuf";
import type { Folder } from "@sola_mpd/shared/src/models/file_explore_pb.js";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";

import type { MpdClient } from "../../mpd";

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

export async function fetchFileExploreFolders(
	mpdClient: MpdClient,
	mpdProfile: MpdProfile,
): Promise<Folder[]> {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
			profile: mpdProfile,
			command: {
				case: "listAllFolders",
				value: {},
			},
		}),
	);
	if (res.command.case !== "listAllFolders") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.folders;
}
