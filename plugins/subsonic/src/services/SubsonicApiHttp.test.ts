import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import {
	Song_MetadataTag,
	Song_MetadataValueSchema,
	SongSchema,
} from "@sola_mpd/shared/src/models/song_pb.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubsonicApiHttp } from "./SubsonicApiHttp.js";

describe("SubsonicApiHttp", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("rejects immediately on 4xx HTTP errors without retrying", async () => {
		const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("Unauthorized", {
				status: 401,
				statusText: "Unauthorized",
			}),
		);
		const client = new SubsonicApiHttp("http://localhost:4533/rest", "u", "p", {
			fetchRetries: 2,
			minBackoffMs: 1,
			maxBackoffMs: 2,
		});

		await expect(
			client.add({ id: "s1" }, { id: "pl1", name: "Test" }),
		).rejects.toThrow("Subsonic HTTP error: 401 Unauthorized");
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it("surfaces Subsonic API error status on add and delete", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					"subsonic-response": {
						status: "failed",
						error: { code: 40, message: "Wrong username or password" },
					},
				}),
				{ status: 200 },
			),
		);
		const client = new SubsonicApiHttp("http://localhost:4533/rest", "u", "p", {
			fetchRetries: 0,
		});

		await expect(client.delete({ id: "pl1", name: "Test" })).rejects.toThrow(
			"Subsonic API error: Wrong username or password",
		);
	});

	it("does not crash when finding a song with missing metadata tags", async () => {
		const fetchSpy = vi.spyOn(globalThis, "fetch");
		const client = new SubsonicApiHttp("http://localhost:4533/rest", "u", "p");
		const emptySong = create(SongSchema);

		const result = await client.find(emptySong);
		expect(result).toBeUndefined();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("does not retry 401 errors inside find() searchWithRetry loop", async () => {
		const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("Unauthorized", {
				status: 401,
				statusText: "Unauthorized",
			}),
		);
		const client = new SubsonicApiHttp("http://localhost:4533/rest", "u", "p", {
			fetchRetries: 2,
			searchRetries: 5,
			minBackoffMs: 1,
			maxBackoffMs: 2,
		});
		const song = create(SongSchema, {
			metadata: {
				[Song_MetadataTag.TITLE]: create(Song_MetadataValueSchema, {
					value: {
						case: "stringValue",
						value: create(StringValueSchema, { value: "Track 1" }),
					},
				}),
			},
		});

		await expect(client.find(song)).rejects.toThrow(
			"Subsonic HTTP error: 401 Unauthorized",
		);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});
});
