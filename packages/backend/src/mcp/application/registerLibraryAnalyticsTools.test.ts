import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerLibraryAnalyticsTools } from "./registerLibraryAnalyticsTools.js";
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
	MpdProfileNotFoundError: class extends Error {},
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

describe("registerLibraryAnalyticsTools / library_top_by_tag", () => {
	it("defaults by=count and limit=25 and includes them in the envelope", async () => {
		const libraryIndex = makeLibraryIndex({
			topByTag: vi.fn(() => ({
				rows: [{ value: "rock", song_count: 7, duration_seconds: 1234 }],
				distinct_values_seen: 1,
			})),
		});
		const server = createFakeMcpServer();
		registerLibraryAnalyticsTools(server as never, {
			mpdClient: makeMpdClientWithListAll(),
			libraryIndex,
		});

		const result = await server.call("library_top_by_tag", { tag: "genre" });
		const body = parseToolJson<{ tag: string; by: string; rows: unknown[] }>(
			result,
		);
		expect(body.tag).toBe("genre");
		expect(body.by).toBe("count");
		expect(libraryIndex.topByTag).toHaveBeenCalledWith("genre", "count", 25);
	});
});

describe("registerLibraryAnalyticsTools / library_artist_summary", () => {
	it("returns found=true when artistSummary resolves", async () => {
		const libraryIndex = makeLibraryIndex({
			artistSummary: vi.fn(() => ({
				name: "Aphex Twin",
				song_count: 100,
				album_count: 8,
				duration_seconds: 12345,
				first_added: null,
				last_added: null,
				earliest_release: null,
				latest_release: null,
				genres: ["electronic"],
				formats: ["FLAC 44100/16/2"],
			})),
		});
		const server = createFakeMcpServer();
		registerLibraryAnalyticsTools(server as never, {
			mpdClient: makeMpdClientWithListAll(),
			libraryIndex,
		});
		const result = await server.call("library_artist_summary", {
			name: "Aphex Twin",
		});
		const body = parseToolJson<{ found: boolean; name: string }>(result);
		expect(body.found).toBe(true);
		expect(body.name).toBe("Aphex Twin");
	});

	it("returns found=false with suggestions on a miss", async () => {
		const libraryIndex = makeLibraryIndex({
			artistSummary: vi.fn(() => undefined),
			findArtistCandidates: vi.fn(() => ["Aphex Twin"]),
		});
		const server = createFakeMcpServer();
		registerLibraryAnalyticsTools(server as never, {
			mpdClient: makeMpdClientWithListAll(),
			libraryIndex,
		});
		const result = await server.call("library_artist_summary", {
			name: "aphex twn",
		});
		const body = parseToolJson<{
			found: boolean;
			name_searched: string;
			suggestions: string[];
		}>(result);
		expect(body.found).toBe(false);
		expect(body.name_searched).toBe("aphex twn");
		expect(body.suggestions).toEqual(["Aphex Twin"]);
	});
});

describe("registerLibraryAnalyticsTools / library_recently_added_by_artist", () => {
	it("translates since_days into a Date and forwards the limit", async () => {
		const libraryIndex = makeLibraryIndex({
			recentlyAddedByArtist: vi.fn(() => ({
				rows: [],
				distinct_values_seen: 0,
			})),
		});
		const server = createFakeMcpServer();
		registerLibraryAnalyticsTools(server as never, {
			mpdClient: makeMpdClientWithListAll(),
			libraryIndex,
		});
		const before = Date.now();
		await server.call("library_recently_added_by_artist", {
			limit: 5,
			since_days: 7,
		});
		const after = Date.now();
		const call = (
			libraryIndex.recentlyAddedByArtist as unknown as {
				mock: { calls: unknown[][] };
			}
		).mock.calls[0]?.[0] as { limit: number; since: Date };
		expect(call.limit).toBe(5);
		const sevenDays = 7 * 24 * 3600 * 1000;
		expect(call.since.getTime()).toBeGreaterThanOrEqual(before - sevenDays);
		expect(call.since.getTime()).toBeLessThanOrEqual(after - sevenDays);
	});
});
