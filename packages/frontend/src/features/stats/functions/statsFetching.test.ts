import { create } from "@bufbuild/protobuf";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../mpd";

import { fetchStats } from "./statsFetching";

function createMockMpdClient(
	response: Awaited<ReturnType<MpdClient["command"]>>,
): MpdClient {
	return {
		command: vi.fn().mockResolvedValue(response),
		commandBulk: vi.fn(),
	};
}

const profile = create(MpdProfileSchema, {
	name: "test",
	host: "localhost",
	port: 6600,
});

describe("fetchStats", () => {
	it("should return stats on valid response", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "stats", value: { stats: {} } },
			}),
		);

		const result = await fetchStats(client, profile);
		expect(result).toBeDefined();
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchStats(client, profile)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});
