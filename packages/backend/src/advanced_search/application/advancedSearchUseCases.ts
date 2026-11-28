import { create } from "@bufbuild/protobuf";
import {
	type AdvancedSearchRequest,
	type AdvancedSearchResponse,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/shared/src/models/song_pb.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import {
	createAddToPlaylistRequests,
	createErrorResponse,
	createListPlaylistRequest,
	createRemovePlaylistRequest,
	createTempPlaylistName,
} from "../functions/advancedSearchFunctions.js";
import type { AdvancedSearchApi } from "../services/AdvancedSearchApi.js";

export const fetchSongs = async (
	profile: MpdProfile,
	filePaths: string[],
	mpdClient: MpdClient,
): Promise<Song[]> => {
	// MPD has no playlist to list when nothing was added to it.
	if (filePaths.length === 0) {
		return [];
	}

	const playlistName = createTempPlaylistName(Math.random());
	try {
		await mpdClient.executeBulk(
			createAddToPlaylistRequests(profile, playlistName, filePaths),
		);
		const response = await mpdClient.execute(
			createListPlaylistRequest(profile, playlistName),
		);
		return response.command?.case === "listplaylistinfo"
			? response.command.value.songs
			: [];
	} finally {
		try {
			await mpdClient.execute(
				createRemovePlaylistRequest(profile, playlistName),
			);
		} catch (err) {
			console.error(`Failed to remove temporary playlist ${playlistName}`, err);
		}
	}
};

export const executeAdvancedSearchRequestUseCase = async (
	req: AdvancedSearchRequest,
	advancedSearchApi: AdvancedSearchApi,
	mpdClient: MpdClient,
): Promise<AdvancedSearchResponse> => {
	switch (req.command?.case) {
		case "stats":
			try {
				if (req.config?.endpoint === undefined) {
					throw new Error("Endpoint is undefined");
				}
				const stats = await advancedSearchApi.fetchStats(req.config.endpoint);
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
				const result = await advancedSearchApi.searchTextToMusic({
					endpoint: req.config.endpoint,
					query: req.command.value.query,
					textToMusicType: req.command.value.textToMusicType,
					limit: req.config.limit ?? 10,
				});
				if (result.kind === "error") {
					return createErrorResponse(result.message);
				}

				const songs = await fetchSongs(
					req.command.value.profile,
					result.filePaths,
					mpdClient,
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

				const result = await advancedSearchApi.searchSimilarSongs({
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
					mpdClient,
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
				await advancedSearchApi.scanLibrary(req.config.endpoint);
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
				// Lainbow removes deleted songs while scanning, so a vacuum is a scan.
				await advancedSearchApi.scanLibrary(req.config.endpoint);
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
				await advancedSearchApi.analyze(req.config.endpoint);
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
			return createErrorResponse(`Unknown command: ${req.command?.case}`);
	}
};
