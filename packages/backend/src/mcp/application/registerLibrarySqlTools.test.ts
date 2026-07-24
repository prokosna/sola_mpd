import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerLibrarySqlTools } from "./registerLibrarySqlTools.js";
import {
	createFakeMcpServer,
	makeLibraryIndex,
	makeMpdClient,
	makeMpdResponse,
	makeProfile,
	parseToolJson,
} from "./testHelpers.js";

vi.mock("../utils/currentMpdProfile.js", () => ({
	NoCurrentMpdProfileError: class extends Error {},
	resolveCurrentMpdProfile: vi.fn(),
	listMpdProfiles: vi.fn(),
}));

const { resolveCurrentMpdProfile } = await import(
	"../utils/currentMpdProfile.js"
);
const resolveMock = vi.mocked(resolveCurrentMpdProfile);

beforeEach(() => {
	resolveMock.mockReset();
	resolveMock.mockReturnValue(makeProfile());
});

function makeMpdClientWithListAll() {
	return makeMpdClient(() =>
		makeMpdResponse({
			command: { case: "listAllSongs", value: { songs: [] } },
		}),
	);
}

describe("registerLibrarySqlTools / library_query_sql", () => {
	it("forwards SELECT to LibraryIndex.querySql with default row_limit 1000", async () => {
		const libraryIndex = makeLibraryIndex({
			querySql: vi.fn(() => ({
				columns: ["c"],
				rows: [[1]],
				row_count: 1,
				truncated: false,
			})),
		});
		const server = createFakeMcpServer();
		registerLibrarySqlTools(server as never, {
			mpdClient: makeMpdClientWithListAll(),
			libraryIndex,
		});
		const result = await server.call("library_query_sql", {
			sql: "SELECT 1 AS c",
		});
		const body = parseToolJson<{
			columns: string[];
			rows: unknown[][];
			row_count: number;
		}>(result);
		expect(body.row_count).toBe(1);
		expect(libraryIndex.querySql).toHaveBeenCalledWith(
			"SELECT 1 AS c",
			[],
			1000,
		);
	});

	it("rejects non-SELECT statements via validateSelectSql before hitting the index", async () => {
		const libraryIndex = makeLibraryIndex({
			querySql: vi.fn(() => ({
				columns: [],
				rows: [],
				row_count: 0,
				truncated: false,
			})),
		});
		const server = createFakeMcpServer();
		registerLibrarySqlTools(server as never, {
			mpdClient: makeMpdClientWithListAll(),
			libraryIndex,
		});
		const result = await server.call("library_query_sql", {
			sql: "DELETE FROM songs",
		});
		expect(result.isError).toBe(true);
		expect(libraryIndex.querySql).not.toHaveBeenCalled();
	});
});

describe("registerLibrarySqlTools / library_index_stats", () => {
	it("returns the LibraryIndex.stats() payload", async () => {
		const libraryIndex = makeLibraryIndex({
			stats: vi.fn(() => ({
				song_count: 42,
				last_built_at: "2025-05-22T12:00:00.000Z",
				last_source_signature: "sig",
			})),
		});
		const server = createFakeMcpServer();
		registerLibrarySqlTools(server as never, {
			mpdClient: makeMpdClientWithListAll(),
			libraryIndex,
		});
		const result = await server.call("library_index_stats");
		const body = parseToolJson<{ song_count: number }>(result);
		expect(body.song_count).toBe(42);
	});
});
