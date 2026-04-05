import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	AdvancedSearchCommand_SimilarityType,
	AdvancedSearchCommand_TextToMusicType,
	AdvancedSearchRequestSchema,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import {
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { describe, expect, it, vi } from "vitest";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import type { AdvancedSearchApi } from "../services/AdvancedSearchApi.js";
import {
	executeAdvancedSearchCommandUseCase,
	executeAdvancedSearchRequestUseCase,
} from "./advancedSearchUseCases.js";

const createProfile = () => {
	return create(MpdProfileSchema, {
		name: "default",
		host: "localhost",
		port: 6600,
		password: "",
	});
};

const createAdvancedSearchApi = (
	overrides?: Partial<AdvancedSearchApi>,
): AdvancedSearchApi => {
	return {
		fetchStats: vi.fn(),
		searchTextToMusic: vi.fn(),
		searchSimilarSongs: vi.fn(),
		scanLibrary: vi.fn(),
		vacuumLibrary: vi.fn(),
		analyze: vi.fn(),
		...overrides,
	};
};

const createMpdClient = (overrides?: Partial<MpdClient>): MpdClient => {
	return {
		execute: vi.fn(),
		executeBulk: vi.fn(),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
		...overrides,
	};
};

describe("advancedSearchUseCases", () => {
	it("textToMusicSearch orchestrates API search and MPD playlist fetching", async () => {
		const song = create(SongSchema, {
			path: "music/song.mp3",
		});
		const advancedSearchApi = createAdvancedSearchApi({
			searchTextToMusic: vi.fn().mockResolvedValue(["music/song.mp3"]),
		});
		const mpdClient = createMpdClient({
			executeBulk: vi.fn().mockResolvedValue(undefined),
			execute: vi
				.fn<(request: unknown) => Promise<MpdResponse>>()
				.mockResolvedValueOnce(
					create(MpdResponseSchema, {
						command: {
							case: "listplaylistinfo",
							value: {
								songs: [song],
							},
						},
					}),
				)
				.mockResolvedValueOnce(
					create(MpdResponseSchema, {
						command: {
							case: "rm",
							value: {},
						},
					}),
				),
		});

		const request = create(AdvancedSearchRequestSchema, {
			config: {
				endpoint: "http://localhost:3001",
				limit: 5,
			},
			command: {
				case: "textToMusicSearch",
				value: {
					profile: createProfile(),
					query: "lofi",
					textToMusicType: AdvancedSearchCommand_TextToMusicType.CLAP,
				},
			},
		});

		const result = await executeAdvancedSearchRequestUseCase(
			request,
			advancedSearchApi,
			mpdClient,
		);

		expect(advancedSearchApi.searchTextToMusic).toHaveBeenCalledTimes(1);
		expect(mpdClient.executeBulk).toHaveBeenCalledTimes(1);
		expect(mpdClient.execute).toHaveBeenCalledTimes(2);
		expect(result.command.case).toBe("textToMusicSearch");
		if (result.command.case !== "textToMusicSearch") {
			throw new Error("Unexpected command case");
		}
		expect(result.command.value.songList?.songs).toHaveLength(1);
	});

	it("similaritySearch returns error response on not-found result", async () => {
		const advancedSearchApi = createAdvancedSearchApi({
			searchSimilarSongs: vi.fn().mockResolvedValue({
				kind: "error",
				message: "song not found",
			}),
		});
		const mpdClient = createMpdClient();
		const request = create(AdvancedSearchRequestSchema, {
			config: {
				endpoint: "http://localhost:3001",
			},
			command: {
				case: "similaritySearch",
				value: {
					profile: createProfile(),
					song: create(SongSchema, { path: "music/song.mp3" }),
					similarityType: AdvancedSearchCommand_SimilarityType.MUQ,
				},
			},
		});

		const result = await executeAdvancedSearchRequestUseCase(
			request,
			advancedSearchApi,
			mpdClient,
		);

		expect(result.command.case).toBe("error");
		expect(mpdClient.executeBulk).not.toHaveBeenCalled();
		expect(mpdClient.execute).not.toHaveBeenCalled();
	});

	it("returns endpoint error when config endpoint is missing", async () => {
		const advancedSearchApi = createAdvancedSearchApi();
		const mpdClient = createMpdClient();
		const request = create(AdvancedSearchRequestSchema, {
			command: {
				case: "stats",
				value: {},
			},
		});

		const result = await executeAdvancedSearchRequestUseCase(
			request,
			advancedSearchApi,
			mpdClient,
		);

		expect(result.command.case).toBe("error");
		expect(advancedSearchApi.fetchStats).not.toHaveBeenCalled();
	});

	it("executeAdvancedSearchCommandUseCase encodes response bytes", async () => {
		const advancedSearchApi = createAdvancedSearchApi({
			scanLibrary: vi.fn().mockResolvedValue(undefined),
		});
		const mpdClient = createMpdClient();
		const msg = new Uint8Array(
			toBinary(
				AdvancedSearchRequestSchema,
				create(AdvancedSearchRequestSchema, {
					config: {
						endpoint: "http://localhost:3001",
					},
					command: {
						case: "scanLibrary",
						value: {},
					},
				}),
			),
		);

		const result = await executeAdvancedSearchCommandUseCase(
			msg,
			advancedSearchApi,
			mpdClient,
		);

		const decoded = fromBinary(AdvancedSearchResponseSchema, result);
		expect(decoded.command.case).toBe("scanLibrary");
	});
});
