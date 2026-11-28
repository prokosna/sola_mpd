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
	// MPD has no playlist to list when nothing was added to it.
	if (filePaths.length === 0) {
		return [];
	}

	const playlistName = `${SEARCH_RESULT_PLAYLIST_NAME}_${Math.round(Math.random() * 1000000)}`;
	const removeCommand = create(MpdRequestSchema, {
		profile,
		command: {
			case: "rm",
			value: {
				name: playlistName,
			},
		},
	});

	try {
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
		return response.command?.case === "listplaylistinfo"
			? response.command.value.songs
			: [];
	} finally {
		try {
			await mpdClient.execute(removeCommand);
		} catch (err) {
			console.error(`Failed to remove temporary playlist ${playlistName}`, err);
		}
	}
};
