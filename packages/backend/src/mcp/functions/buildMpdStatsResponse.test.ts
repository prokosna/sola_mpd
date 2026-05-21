import { create } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { MpdStatsSchema } from "@sola_mpd/shared/src/models/mpd/mpd_stats_pb.js";
import { describe, expect, it } from "vitest";

import { buildMpdStatsResponse } from "./buildMpdStatsResponse.js";

describe("buildMpdStatsResponse", () => {
	it("returns the default payload when stats is undefined", () => {
		expect(buildMpdStatsResponse(undefined)).toEqual({
			version: "",
			artists_count: 0,
			albums_count: 0,
			songs_count: 0,
			total_playtime_seconds: 0,
			uptime_seconds: 0,
			last_updated: null,
		});
	});

	it("forwards stat counts and formats last_updated as ISO8601", () => {
		const lastUpdated = new Date("2025-01-02T03:04:05Z");
		const stats = create(MpdStatsSchema, {
			version: "0.24.0",
			artistsCount: 100,
			albumsCount: 200,
			songsCount: 3000,
			totalPlaytime: 654321,
			uptime: 42,
			lastUpdated: timestampFromDate(lastUpdated),
		});
		expect(buildMpdStatsResponse(stats)).toEqual({
			version: "0.24.0",
			artists_count: 100,
			albums_count: 200,
			songs_count: 3000,
			total_playtime_seconds: 654321,
			uptime_seconds: 42,
			last_updated: lastUpdated.toISOString(),
		});
	});

	it("returns null last_updated when timestamp is missing", () => {
		const stats = create(MpdStatsSchema, {
			version: "0.23.0",
			songsCount: 1,
		});
		expect(buildMpdStatsResponse(stats).last_updated).toBeNull();
	});
});
