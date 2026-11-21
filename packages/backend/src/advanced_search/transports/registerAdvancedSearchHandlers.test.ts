import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { SOCKETIO_ADVANCED_SEARCH } from "@sola_mpd/shared/src/const/socketio.js";
import {
	AdvancedSearchRequestSchema,
	AdvancedSearchResponseSchema,
} from "@sola_mpd/shared/src/models/advanced_search_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeMessagingServer } from "../../lib/messaging/fakeMessagingServer.js";
import type { MpdClient } from "../../mpd/services/MpdClient.js";
import type { AdvancedSearchApi } from "../services/AdvancedSearchApi.js";
import { registerAdvancedSearchHandlers } from "./registerAdvancedSearchHandlers.js";

describe("registerAdvancedSearchHandlers", () => {
	const advancedSearchApi = { fetchStats: vi.fn() };
	let fake: ReturnType<typeof createFakeMessagingServer>;

	beforeEach(() => {
		vi.resetAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		fake = createFakeMessagingServer();
		registerAdvancedSearchHandlers(fake.server, {
			advancedSearchApi: advancedSearchApi as unknown as AdvancedSearchApi,
			mpdClient: {} as MpdClient,
		});
	});

	it("returns the encoded search response", async () => {
		advancedSearchApi.fetchStats.mockResolvedValue({});
		const msg = toBinary(
			AdvancedSearchRequestSchema,
			create(AdvancedSearchRequestSchema, {
				config: { endpoint: "http://localhost:1" },
				command: { case: "stats", value: {} },
			}),
		);

		const result = await fake.call(SOCKETIO_ADVANCED_SEARCH, msg);

		expect(
			fromBinary(AdvancedSearchResponseSchema, result as Uint8Array).command
				.case,
		).toBe("stats");
	});

	it("maps an undecodable request to an advanced search error response", async () => {
		const result = await fake.call(
			SOCKETIO_ADVANCED_SEARCH,
			new Uint8Array([0xff, 0xff, 0xff]),
		);

		expect(
			fromBinary(AdvancedSearchResponseSchema, result as Uint8Array).command
				.case,
		).toBe("error");
	});
});
