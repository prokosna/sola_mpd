import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import type {
	LibraryAggregated,
	LibraryAggregationRow,
	LibraryArtistSummary,
	LibraryDecadeRow,
	LibraryFormatRow,
	LibraryGroupableTag,
	LibraryIndex,
	LibraryRecentlyAddedRow,
} from "../services/LibraryIndex.js";
import { resolveCurrentMpdProfile } from "./currentMpdProfile.js";
import { ensureLibraryIndexUseCase } from "./libraryIndexUseCases.js";

type AnalyticsDeps = {
	mpdClient: MpdClient;
	libraryIndex: LibraryIndex;
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
	profileName?: string;
};

async function refreshIndex(input: AnalyticsDeps): Promise<void> {
	const profile = resolveCurrentMpdProfile(
		input.mpdProfileStateRepository,
		input.profileName,
	);
	await ensureLibraryIndexUseCase({
		profile,
		mpdClient: input.mpdClient,
		libraryIndex: input.libraryIndex,
	});
}

export async function getTopByTagUseCase(
	input: {
		tag: LibraryGroupableTag;
		by: "count" | "duration";
		limit: number;
	} & AnalyticsDeps,
): Promise<LibraryAggregated<LibraryAggregationRow>> {
	await refreshIndex(input);
	return input.libraryIndex.topByTag(input.tag, input.by, input.limit);
}

export async function getTagBreakdownUseCase(
	input: { tag: LibraryGroupableTag; limit?: number } & AnalyticsDeps,
): Promise<LibraryAggregated<LibraryAggregationRow>> {
	await refreshIndex(input);
	return input.libraryIndex.breakdown(input.tag, input.limit);
}

export async function getFormatDistributionUseCase(
	input: AnalyticsDeps,
): Promise<LibraryAggregated<LibraryFormatRow>> {
	await refreshIndex(input);
	return input.libraryIndex.formatDistribution();
}

export async function getDecadeBreakdownUseCase(
	input: AnalyticsDeps,
): Promise<LibraryAggregated<LibraryDecadeRow>> {
	await refreshIndex(input);
	return input.libraryIndex.decadeBreakdown();
}

export async function getRecentlyAddedByArtistUseCase(
	input: { limit: number; sinceDays?: number } & AnalyticsDeps,
): Promise<LibraryAggregated<LibraryRecentlyAddedRow>> {
	await refreshIndex(input);
	const since =
		input.sinceDays !== undefined
			? new Date(Date.now() - input.sinceDays * 24 * 3600 * 1000)
			: undefined;
	return input.libraryIndex.recentlyAddedByArtist({
		limit: input.limit,
		since,
	});
}

export type ArtistSummaryResult =
	| { found: true; summary: LibraryArtistSummary }
	| { found: false; suggestions: string[] };

export async function getArtistSummaryUseCase(
	input: { name: string } & AnalyticsDeps,
): Promise<ArtistSummaryResult> {
	await refreshIndex(input);
	const summary = input.libraryIndex.artistSummary(input.name);
	if (summary === undefined) {
		return {
			found: false,
			suggestions: input.libraryIndex.findArtistCandidates(input.name, 10),
		};
	}
	return { found: true, summary };
}
