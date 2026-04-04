import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	type AdvancedSearchRequest,
	AdvancedSearchRequestSchema,
	type AdvancedSearchResponse,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { MpdRequestSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { MpdClientPort } from "../../mpd/services/MpdClientPort.js";
import type { AdvancedSearchApiPort } from "../services/AdvancedSearchApiPort.js";

const SEARCH_RESULT_PLAYLIST_NAME = "_temp_search_result";

export const executeAdvancedSearchCommandUseCase = async (
	msg: Uint8Array,
	advancedSearchApiPort: AdvancedSearchApiPort,
	mpdClientPort: MpdClientPort,
): Promise<Uint8Array> => {
	const request = fromBinary(AdvancedSearchRequestSchema, msg);
	const response = await executeAdvancedSearchRequestUseCase(
		request,
		advancedSearchApiPort,
		mpdClientPort,
	);
	return toBinary(AdvancedSearchResponseSchema, response);
};

export const executeAdvancedSearchRequestUseCase = async (
	req: AdvancedSearchRequest,
	advancedSearchApiPort: AdvancedSearchApiPort,
	mpdClientPort: MpdClientPort,
): Promise<AdvancedSearchResponse> => {
	switch (req.command?.case) {
		case "stats":
			try {
				if (req.config?.endpoint === undefined) {
					throw new Error("Endpoint is undefined");
				}
				const stats = await advancedSearchApiPort.fetchStats(
					req.config.endpoint,
				);
				return create(AdvancedSearchResponseSchema, {
					command: {
						case: "stats",
						value: { stats },
					},
				});
			} catch (err) {
				return createErrorResponse(err);
			}
		case "textToMusicSearch":
			try {
				if (req.config?.endpoint === undefined) {
					throw new Error("Endpoint is undefined");
				}
				if (req.command.value.profile === undefined) {
					throw new Error("Profile is undefined");
				}
				const filePaths = await advancedSearchApiPort.searchTextToMusic({
					endpoint: req.config.endpoint,
					query: req.command.value.query,
					textToMusicType: req.command.value.textToMusicType,
					limit: req.config.limit ?? 10,
				});
				const songs = await fetchSongs(
					req.command.value.profile,
					filePaths,
					mpdClientPort,
				);

				return create(AdvancedSearchResponseSchema, {
					command: {
						case: "textToMusicSearch",
						value: { songList: { songs } },
					},
				});
			} catch (err) {
				return createErrorResponse(err);
			}
		case "similaritySearch":
			try {
				if (req.config?.endpoint === undefined) {
					throw new Error("Endpoint is undefined");
				}
				if (req.command.value.profile === undefined) {
					throw new Error("Profile is undefined");
				}
				if (req.command.value.song === undefined) {
					throw new Error("Song is undefined");
				}

				const result = await advancedSearchApiPort.searchSimilarSongs({
					endpoint: req.config.endpoint,
					songPath: req.command.value.song.path,
					similarityType: req.command.value.similarityType,
					limit: req.config.limit ?? 10,
				});

				if (result.kind === "error") {
					return createErrorResponse(result.message);
				}

				const songs = await fetchSongs(
					req.command.value.profile,
					result.filePaths,
					mpdClientPort,
				);

				return create(AdvancedSearchResponseSchema, {
					command: {
						case: "similaritySearch",
						value: { songList: { songs } },
					},
				});
			} catch (err) {
				return createErrorResponse(err);
			}
		case "scanLibrary":
			try {
				if (req.config?.endpoint === undefined) {
					throw new Error("Endpoint is undefined");
				}
				await advancedSearchApiPort.scanLibrary(req.config.endpoint);
				return create(AdvancedSearchResponseSchema, {
					command: {
						case: "scanLibrary",
						value: {},
					},
				});
			} catch (err) {
				return createErrorResponse(err);
			}
		case "vacuumLibrary":
			try {
				if (req.config?.endpoint === undefined) {
					throw new Error("Endpoint is undefined");
				}
				await advancedSearchApiPort.vacuumLibrary(req.config.endpoint);
				return create(AdvancedSearchResponseSchema, {
					command: {
						case: "vacuumLibrary",
						value: {},
					},
				});
			} catch (err) {
				return createErrorResponse(err);
			}
		case "analyze":
			try {
				if (req.config?.endpoint === undefined) {
					throw new Error("Endpoint is undefined");
				}
				await advancedSearchApiPort.analyze(req.config.endpoint);
				return create(AdvancedSearchResponseSchema, {
					command: {
						case: "analyze",
						value: {},
					},
				});
			} catch (err) {
				return createErrorResponse(err);
			}
		default:
			throw new Error(`Unknown command: ${req.command?.case}`);
	}
};

const createErrorResponse = (err: unknown): AdvancedSearchResponse => {
	return create(AdvancedSearchResponseSchema, {
		command: {
			case: "error",
			value: toErrorMessage(err),
		},
	});
};

const toErrorMessage = (err: unknown): string => {
	if (typeof err === "string") {
		return err;
	}
	if (err instanceof Error) {
		return err.message;
	}
	return "Unknown error";
};

const fetchSongs = async (
	profile: MpdProfile,
	filePaths: string[],
	mpdClientPort: MpdClientPort,
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
	await mpdClientPort.executeBulk(addCommands);

	const getSongsCommand = create(MpdRequestSchema, {
		profile,
		command: {
			case: "listplaylistinfo",
			value: {
				name: playlistName,
			},
		},
	});
	const response = await mpdClientPort.execute(getSongsCommand);
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
	await mpdClientPort.execute(removeCommand);

	return songs;
};
