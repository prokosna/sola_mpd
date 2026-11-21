import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import { validateSelectSql } from "../functions/validateSelectSql.js";
import type {
	LibraryIndex,
	LibraryIndexStats,
	LibrarySqlResult,
} from "../services/LibraryIndex.js";
import { resolveCurrentMpdProfile } from "./currentMpdProfile.js";
import { ensureLibraryIndexUseCase } from "./libraryIndexUseCases.js";

type SqlDeps = {
	mpdClient: MpdClient;
	libraryIndex: LibraryIndex;
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
	profileName?: string;
};

async function refreshIndex(input: SqlDeps): Promise<void> {
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

export function describeLibraryIndexUseCase(input: {
	libraryIndex: LibraryIndex;
}): { sql_schema: string; notes: string } {
	return input.libraryIndex.describe();
}

export async function queryLibrarySqlUseCase(
	input: { sql: string; params: unknown[]; rowLimit: number } & SqlDeps,
): Promise<LibrarySqlResult> {
	await refreshIndex(input);
	validateSelectSql(input.sql);
	return input.libraryIndex.querySql(input.sql, input.params, input.rowLimit);
}

export async function getLibraryIndexStatsUseCase(
	input: SqlDeps,
): Promise<LibraryIndexStats> {
	await refreshIndex(input);
	return input.libraryIndex.stats();
}
