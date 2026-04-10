import { create } from "@bufbuild/protobuf";
import {
	AdvancedSearchResponseSchema,
	AdvancedSearchStatsSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { AdvancedSearchClient } from "../services/AdvancedSearchClient";

import {
	analyze,
	fetchAdvancedSearchStats,
	scanLibrary,
	vacuumLibrary,
} from "./advancedSearchOperations";

function createMockClient(
	response: Awaited<ReturnType<AdvancedSearchClient["command"]>>,
): AdvancedSearchClient {
	return {
		command: vi.fn().mockResolvedValue(response),
	};
}

const endpoint = "http://localhost:8080";

describe("fetchAdvancedSearchStats", () => {
	it("should return stats on valid response", async () => {
		const stats = create(AdvancedSearchStatsSchema, {
			totalSongs: 100,
			songsWithMuq: 50,
		});
		const client = createMockClient(
			create(AdvancedSearchResponseSchema, {
				command: { case: "stats", value: { stats } },
			}),
		);

		const result = await fetchAdvancedSearchStats(client, endpoint);
		expect(result.totalSongs).toBe(100);
		expect(result.songsWithMuq).toBe(50);
	});

	it("should throw on invalid response type", async () => {
		const client = createMockClient(
			create(AdvancedSearchResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchAdvancedSearchStats(client, endpoint)).rejects.toThrow(
			"Invalid AdvancedSearch response",
		);
	});
});

describe("scanLibrary", () => {
	it("should resolve on valid response", async () => {
		const client = createMockClient(
			create(AdvancedSearchResponseSchema, {
				command: { case: "scanLibrary", value: {} },
			}),
		);

		await expect(scanLibrary(client, endpoint)).resolves.toBeUndefined();
		expect(client.command).toHaveBeenCalledOnce();
	});

	it("should propagate client error", async () => {
		const client: AdvancedSearchClient = {
			command: vi.fn().mockRejectedValue(new Error("connection failed")),
		};

		await expect(scanLibrary(client, endpoint)).rejects.toThrow(
			"connection failed",
		);
	});
});

describe("vacuumLibrary", () => {
	it("should resolve on valid response", async () => {
		const client = createMockClient(
			create(AdvancedSearchResponseSchema, {
				command: { case: "vacuumLibrary", value: {} },
			}),
		);

		await expect(vacuumLibrary(client, endpoint)).resolves.toBeUndefined();
		expect(client.command).toHaveBeenCalledOnce();
	});

	it("should propagate client error", async () => {
		const client: AdvancedSearchClient = {
			command: vi.fn().mockRejectedValue(new Error("connection failed")),
		};

		await expect(vacuumLibrary(client, endpoint)).rejects.toThrow(
			"connection failed",
		);
	});
});

describe("analyze", () => {
	it("should resolve on valid response", async () => {
		const client = createMockClient(
			create(AdvancedSearchResponseSchema, {
				command: { case: "analyze", value: {} },
			}),
		);

		await expect(analyze(client, endpoint)).resolves.toBeUndefined();
		expect(client.command).toHaveBeenCalledOnce();
	});

	it("should propagate client error", async () => {
		const client: AdvancedSearchClient = {
			command: vi.fn().mockRejectedValue(new Error("connection failed")),
		};

		await expect(analyze(client, endpoint)).rejects.toThrow(
			"connection failed",
		);
	});
});
