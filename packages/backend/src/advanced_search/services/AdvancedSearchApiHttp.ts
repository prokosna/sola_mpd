import { create } from "@bufbuild/protobuf";
import {
	AdvancedSearchCommand_SimilarityType,
	AdvancedSearchCommand_TextToMusicType,
	AdvancedSearchStatsSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import type {
	AdvancedSearchApi,
	SearchSimilarSongsInput,
	SearchSimilarSongsResult,
	SearchTextToMusicInput,
	SearchTextToMusicResult,
} from "./AdvancedSearchApi.js";

const SONG_NOT_ANALYZED_MESSAGE =
	"This song has not been analyzed yet. Lainbow analyzes new songs automatically, so please try again later.";
const TEXT_SEARCH_NOT_READY_MESSAGE =
	"Text search is not ready yet. Lainbow's analysis engine is starting up or not running.";

async function readDetail(response: Response): Promise<string | undefined> {
	try {
		const body = await response.json();
		const detail = body?.detail;
		if (typeof detail === "string") {
			return detail;
		}
		if (detail !== undefined) {
			return JSON.stringify(detail);
		}
	} catch {
		// The body is not JSON; fall back to the status text.
	}
	return undefined;
}

async function unprocessableMessage(response: Response): Promise<string> {
	const detail = (await readDetail(response)) ?? response.statusText;
	return `Lainbow cannot run this search: ${detail}`;
}

class AdvancedSearchApiHttp implements AdvancedSearchApi {
	async fetchStats(endpoint: string) {
		const url = `${endpoint}/api/v1/stats`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Health check failed with status ${response.status}`);
		}
		const stats = await response.json();
		return create(AdvancedSearchStatsSchema, {
			totalSongs: stats.total_songs,
			// Lainbow no longer has the acoustic-features model.
			songsWithAcousticFeatures: stats.songs_with_acoustic_features ?? 0,
			songsWithMert: stats.songs_with_mert,
			songsWithClap: stats.songs_with_clap,
			songsWithMuq: stats.songs_with_muq,
			songsWithMuqMulan: stats.songs_with_muq_mulan,
			pendingTasks: stats.pending_tasks,
			runningTasks: stats.running_tasks,
		});
	}

	async searchTextToMusic(
		input: SearchTextToMusicInput,
	): Promise<SearchTextToMusicResult> {
		const params = new URLSearchParams();
		params.append("q", input.query);
		params.append(
			"model_name",
			this.convertTextToMusicTypeToModelName(input.textToMusicType),
		);
		if (input.limit > 0) {
			params.append("limit", input.limit.toString());
		}

		const url = `${input.endpoint}/api/v1/songs/search?${params.toString()}`;
		const response = await fetch(url);
		if (!response.ok) {
			if (response.status === 503) {
				return { kind: "error", message: TEXT_SEARCH_NOT_READY_MESSAGE };
			}
			if (response.status === 422) {
				return {
					kind: "error",
					message: await unprocessableMessage(response),
				};
			}
			throw new Error(
				`textToMusicSearch failed with status ${response.status}`,
			);
		}

		const songList = await response.json();
		return {
			kind: "songs",
			filePaths: songList.songs.map(
				(song: { file_path: string }) => song.file_path,
			),
		};
	}

	async searchSimilarSongs(
		input: SearchSimilarSongsInput,
	): Promise<SearchSimilarSongsResult> {
		const params = new URLSearchParams();
		params.append(
			"model_name",
			this.convertSimilarityTypeToModelName(input.similarityType),
		);
		if (input.limit > 0) {
			params.append("limit", input.limit.toString());
		}

		const encodedFilePath = encodeURIComponent(input.songPath);
		const url = `${input.endpoint}/api/v1/songs/${encodedFilePath}/similar?${params.toString()}`;
		const response = await fetch(url);

		if (!response.ok) {
			if (response.status === 404) {
				return { kind: "error", message: SONG_NOT_ANALYZED_MESSAGE };
			}
			if (response.status === 422) {
				return {
					kind: "error",
					message: await unprocessableMessage(response),
				};
			}
			throw new Error(
				`searchSimilarSongs failed with status ${response.status}`,
			);
		}

		const searchResult = await response.json();
		return {
			kind: "songs",
			filePaths: searchResult.songs.map((song: { file_path: string }) => {
				return song.file_path;
			}),
		};
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
				throw new Error(
					"Acoustic-features similarity is no longer available in Lainbow",
				);
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

	async scanLibrary(endpoint: string): Promise<void> {
		const url = `${endpoint}/api/v1/batch/scan/run`;
		const response = await fetch(url, {
			method: "POST",
		});
		if (!response.ok) {
			throw new Error(`Scan library failed with status ${response.status}`);
		}
	}

	async analyze(endpoint: string): Promise<void> {
		const url = `${endpoint}/api/v1/batch/analyze/run`;
		const response = await fetch(url, {
			method: "POST",
		});
		if (!response.ok) {
			throw new Error(`Analyze failed with status ${response.status}`);
		}
	}
}

export const advancedSearchApiHttp: AdvancedSearchApi =
	new AdvancedSearchApiHttp();
