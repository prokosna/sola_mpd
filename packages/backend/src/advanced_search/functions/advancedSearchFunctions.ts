import { create } from "@bufbuild/protobuf";
import {
	type AdvancedSearchResponse,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import {
	type MpdRequest,
	MpdRequestSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
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

export const createTempPlaylistName = (random: number): string => {
	return `${SEARCH_RESULT_PLAYLIST_NAME}_${Math.round(random * 1000000)}`;
};

export const createAddToPlaylistRequests = (
	profile: MpdProfile,
	playlistName: string,
	filePaths: string[],
): MpdRequest[] => {
	return filePaths.map((filePath) =>
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "playlistadd",
				value: { name: playlistName, uri: filePath },
			},
		}),
	);
};

export const createListPlaylistRequest = (
	profile: MpdProfile,
	playlistName: string,
): MpdRequest => {
	return create(MpdRequestSchema, {
		profile,
		command: { case: "listplaylistinfo", value: { name: playlistName } },
	});
};

export const createRemovePlaylistRequest = (
	profile: MpdProfile,
	playlistName: string,
): MpdRequest => {
	return create(MpdRequestSchema, {
		profile,
		command: { case: "rm", value: { name: playlistName } },
	});
};
