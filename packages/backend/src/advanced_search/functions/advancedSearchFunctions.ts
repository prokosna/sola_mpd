import { create } from "@bufbuild/protobuf";
import {
	type AdvancedSearchResponse,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { toErrorMessage } from "../../utils/errorUtils.js";

export { toErrorMessage };

const SEARCH_RESULT_PLAYLIST_NAME = "_temp_search_result";

export const createErrorResponse = (err: unknown): AdvancedSearchResponse => {
	return create(AdvancedSearchResponseSchema, {
		command: {
			case: "error",
			value: toErrorMessage(err),
		},
	});
};

export const fetchSongs = async (
	profile: MpdProfile,
	filePaths: string[],
	mpdClient: MpdClient,
): Promise<Song[]> => {
	const playlistName = `${SEARCH_RESULT_PLAYLIST_NAME}_${Math.round(Math.random() * 1000000)}`;
	const addCommands = filePaths.map((filePath) =>
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "playlistadd",
				value: {
					name: playlistName,
					uri: filePath,
				},
			},
		}),
	);
	await mpdClient.executeBulk(addCommands);

	const getSongsCommand = create(MpdRequestSchema, {
		profile,
		command: {
			case: "listplaylistinfo",
			value: {
				name: playlistName,
			},
		},
	});
	const response = await mpdClient.execute(getSongsCommand);
	const songs =
		response.command?.case === "listplaylistinfo"
			? response.command.value.songs
			: [];

	const removeCommand = create(MpdRequestSchema, {
		profile,
		command: {
			case: "rm",
			value: {
				name: playlistName,
			},
		},
	});
	await mpdClient.execute(removeCommand);

	return songs;
};
