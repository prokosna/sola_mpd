import { create, type MessageInitShape } from "@bufbuild/protobuf";
import {
	type MpdRequest,
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	type MpdProfile,
	MpdProfileSchema,
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { vi } from "vitest";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import type { LibraryIndex } from "../services/LibraryIndex.js";

export function makeProfile(): MpdProfile {
	return create(MpdProfileSchema, {
		name: "test",
		host: "localhost",
		port: 6600,
	});
}

export function makeMpdProfileStateRepository(): ConfigRepository<MpdProfileState> {
	return {
		get: vi.fn(() => create(MpdProfileStateSchema, {})),
		update: vi.fn(),
	};
}

export function makeMpdResponse(
	init: MessageInitShape<typeof MpdResponseSchema>,
): MpdResponse {
	return create(MpdResponseSchema, init);
}

export function makeMpdClient(
	respond: (req: MpdRequest) => MpdResponse | Promise<MpdResponse>,
): MpdClient {
	return {
		execute: vi.fn(async (req: MpdRequest) => respond(req)),
		executeBulk: vi.fn(async () => undefined),
		subscribe: vi.fn(async () => () => undefined),
		unsubscribe: vi.fn(async () => true),
	};
}

export function makeLibraryIndex(
	overrides: Partial<LibraryIndex> = {},
): LibraryIndex {
	return {
		refreshIfNeeded: vi.fn(() => false),
		stats: vi.fn(() => ({
			song_count: 0,
			last_built_at: null,
			last_source_signature: null,
		})),
		topByTag: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		breakdown: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		formatDistribution: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		decadeBreakdown: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		recentlyAddedByArtist: vi.fn(() => ({
			rows: [],
			distinct_values_seen: 0,
		})),
		artistSummary: vi.fn(() => undefined),
		findArtistCandidates: vi.fn(() => []),
		querySql: vi.fn(() => ({
			columns: [],
			rows: [],
			row_count: 0,
			truncated: false,
		})),
		describe: vi.fn(() => ({
			sql_schema: "schema",
			notes: "notes",
		})),
		close: vi.fn(),
		...overrides,
	};
}
