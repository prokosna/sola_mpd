import { create } from "@bufbuild/protobuf";
import {
	AdvancedSearchCommand_SimilarityType,
	AdvancedSearchCommand_TextToMusicType,
	type AdvancedSearchRequest,
	type AdvancedSearchResponse,
	AdvancedSearchResponseSchema,
	type AdvancedSearchStats,
	AdvancedSearchStatsSchema,
} from "@sola_mpd/domain/src/models/advanced_search_pb.js";
import { MpdRequestSchema } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import type { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { mpdClient } from "../mpd/mpdClient.js";

class AdvancedSearchClient {
	private static readonly SEARCH_RESULT_PLAYLIST_NAME = "_temp_search_result";

	async execute(req: AdvancedSearchRequest): Promise<AdvancedSearchResponse> {
		switch (req.command?.case) {
			case "stats":
				try {
					if (req.config?.endpoint === undefined) {
						throw new Error("Endpoint is undefined");
					}
					const stats = await this.fetchStats(req.config.endpoint);
					return create(AdvancedSearchResponseSchema, {
						command: {
							case: "stats",
							value: { stats },
						},
					});
				} catch (err) {
					return create(AdvancedSearchResponseSchema, {
						command: {
							case: "error",
							value: err instanceof Error ? err.message : "Unknown error",
						},
					});
				}
			case "textToMusicSearch":
				try {
					if (req.config?.endpoint === undefined) {
						throw new Error("Endpoint is undefined");
					}
					if (req.command.value.profile === undefined) {
						throw new Error("Profile is undefined");
					}
					return await this.textToMusicSearch(
						req.command.value.profile,
						req.config.endpoint,
						req.command.value.query,
						req.command.value.textToMusicType,
						req.config.limit ?? 10,
					);
				} catch (err) {
					return create(AdvancedSearchResponseSchema, {
						command: {
							case: "error",
							value: err instanceof Error ? err.message : "Unknown error",
						},
					});
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
					return await this.searchSimilarSongs(
						req.command.value.profile,
						req.config.endpoint,
						req.command.value.song,
						req.command.value.similarityType,
						req.config.limit ?? 10,
					);
				} catch (err) {
					return create(AdvancedSearchResponseSchema, {
						command: {
							case: "error",
							value: err instanceof Error ? err.message : "Unknown error",
						},
					});
				}
			case "scanLibrary":
				try {
					if (req.config?.endpoint === undefined) {
						throw new Error("Endpoint is undefined");
					}
					return await this.scanLibrary(req.config.endpoint);
				} catch (err) {
					return create(AdvancedSearchResponseSchema, {
						command: {
							case: "error",
							value: err instanceof Error ? err.message : "Unknown error",
						},
					});
				}
			case "vacuumLibrary":
				try {
					if (req.config?.endpoint === undefined) {
						throw new Error("Endpoint is undefined");
					}
					return await this.vacuumLibrary(req.config.endpoint);
				} catch (err) {
					return create(AdvancedSearchResponseSchema, {
						command: {
							case: "error",
							value: err instanceof Error ? err.message : "Unknown error",
						},
					});
				}
			case "analyze":
				try {
					if (req.config?.endpoint === undefined) {
						throw new Error("Endpoint is undefined");
					}
					return await this.analyze(req.config.endpoint);
				} catch (err) {
					return create(AdvancedSearchResponseSchema, {
						command: {
							case: "error",
							value: err instanceof Error ? err.message : "Unknown error",
						},
					});
				}
			default:
				throw new Error(`Unknown command: ${req.command?.case}`);
		}
	}

	private async fetchStats(endpoint: string): Promise<AdvancedSearchStats> {
		const url = `${endpoint}/api/v1/stats`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Health check failed with status ${response.status}`);
		}
		const stats = await response.json();
		return create(AdvancedSearchStatsSchema, {
			totalSongs: stats.total_songs,
			songsWithAcousticFeatures: stats.songs_with_acoustic_features,
			songsWithMert: stats.songs_with_mert,
			songsWithClap: stats.songs_with_clap,
			songsWithMuq: stats.songs_with_muq,
			songsWithMuqMulan: stats.songs_with_muq_mulan,
			pendingTasks: stats.pending_tasks,
			runningTasks: stats.running_tasks,
		});
	}

	private async fetchSongs(
		profile: MpdProfile,
		filePaths: string[],
	): Promise<Song[]> {
		const playlistName = `${AdvancedSearchClient.SEARCH_RESULT_PLAYLIST_NAME}_${Math.round(Math.random() * 1000000)}`;
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
		const resp = await mpdClient.execute(getSongsCommand);
		const songs =
			resp.command?.case === "listplaylistinfo" ? resp.command.value.songs : [];

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
	}

	private async textToMusicSearch(
		profile: MpdProfile,
		endpoint: string,
		q: string,
		textToMusicType: AdvancedSearchCommand_TextToMusicType,
		limit: number,
	): Promise<AdvancedSearchResponse> {
		const params = new URLSearchParams();
		params.append("q", q);
		params.append(
			"model_name",
			this.convertTextToMusicTypeToModelName(textToMusicType),
		);
		if (limit > 0) {
			params.append("limit", limit.toString());
		}

		const url = `${endpoint}/api/v1/songs/search?${params.toString()}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(
				`textToMusicSearch failed with status ${response.status}`,
			);
		}

		const songList = await response.json();
		const filePaths: string[] = songList.songs.map(
			(song: { file_path: string }) => song.file_path,
		);
		const songs = await this.fetchSongs(profile, filePaths);

		return create(AdvancedSearchResponseSchema, {
			command: {
				case: "textToMusicSearch",
				value: { songList: { songs } },
			},
		});
	}

	private async searchSimilarSongs(
		profile: MpdProfile,
		endpoint: string,
		song: Song,
		similarityType: AdvancedSearchCommand_SimilarityType,
		limit: number,
	): Promise<AdvancedSearchResponse> {
		const params = new URLSearchParams();
		const modelName = this.convertSimilarityTypeToModelName(similarityType);
		params.append("model_name", modelName);
		if (limit > 0) {
			params.append("limit", limit.toString());
		}

		const encodedFilePath = encodeURIComponent(song.path);
		const url = `${endpoint}/api/v1/songs/${encodedFilePath}/similar?${params.toString()}`;

		const response = await fetch(url);

		if (!response.ok) {
			if (response.status === 404) {
				return create(AdvancedSearchResponseSchema, {
					command: {
						case: "error",
						value: `The song (${song.path}) not found. You may need to scan the library and run analyze to find similar songs.`,
					},
				});
			}

			throw new Error(
				`searchSimilarSongs failed with status ${response.status}`,
			);
		}

		const searchResult = await response.json();
		const filePaths: string[] = searchResult.songs.map(
			(s: { file_path: string }) => s.file_path,
		);
		const songs = await this.fetchSongs(profile, filePaths);

		return create(AdvancedSearchResponseSchema, {
			command: {
				case: "similaritySearch",
				value: { songList: { songs } },
			},
		});
	}

	private convertSimilarityTypeToModelName(
		similarityType: AdvancedSearchCommand_SimilarityType,
	): string {
		switch (similarityType) {
			case AdvancedSearchCommand_SimilarityType.MUQ:
				return "muq";
			case AdvancedSearchCommand_SimilarityType.MERT:
				return "mert";
			case AdvancedSearchCommand_SimilarityType.ACOUSTIC_FEATURES:
				return "acoustic_features";
			default: {
				const exhaustiveCheck: never = similarityType;
				throw new Error(`Unknown similarity type: ${exhaustiveCheck}`);
			}
		}
	}

	private convertTextToMusicTypeToModelName(
		textToMusicType: AdvancedSearchCommand_TextToMusicType,
	): string {
		switch (textToMusicType) {
			case AdvancedSearchCommand_TextToMusicType.MUQ_MULAN:
				return "muq_mulan";
			case AdvancedSearchCommand_TextToMusicType.CLAP:
				return "clap";
			default: {
				const exhaustiveCheck: never = textToMusicType;
				throw new Error(`Unknown text to music type: ${exhaustiveCheck}`);
			}
		}
	}

	private async scanLibrary(endpoint: string): Promise<AdvancedSearchResponse> {
		const url = `${endpoint}/api/v1/batch/scan/run`;
		const response = await fetch(url, {
			method: "POST",
		});
		if (!response.ok) {
			throw new Error(`Scan library failed with status ${response.status}`);
		}
		return create(AdvancedSearchResponseSchema, {
			command: {
				case: "scanLibrary",
				value: {},
			},
		});
	}

	private async vacuumLibrary(
		endpoint: string,
	): Promise<AdvancedSearchResponse> {
		const url = `${endpoint}/api/v1/batch/vacuum/run`;
		const response = await fetch(url, {
			method: "POST",
		});
		if (!response.ok) {
			throw new Error(
				`Prune stale items failed with status ${response.status}`,
			);
		}
		return create(AdvancedSearchResponseSchema, {
			command: {
				case: "vacuumLibrary",
				value: {},
			},
		});
	}

	private async analyze(endpoint: string): Promise<AdvancedSearchResponse> {
		const url = `${endpoint}/api/v1/batch/analyze/run`;
		const response = await fetch(url, {
			method: "POST",
		});
		if (!response.ok) {
			throw new Error(`Analyze failed with status ${response.status}`);
		}
		return create(AdvancedSearchResponseSchema, {
			command: {
				case: "analyze",
				value: {},
			},
		});
	}
}

export type { AdvancedSearchClient };
export const advancedSearchClient = new AdvancedSearchClient();
