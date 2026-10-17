import { create } from "@bufbuild/protobuf";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerQueueTools } from "./registerQueueTools.js";
import {
	createFakeMcpServer,
	makeLibraryIndex,
	makeMpdClient,
	makeMpdResponse,
	makeProfile,
	parseToolJson,
} from "./testHelpers.js";

vi.mock("./currentMpdProfile.js", () => ({
	NoCurrentMpdProfileError: class extends Error {},
	MpdProfileNotFoundError: class extends Error {},
	resolveCurrentMpdProfile: vi.fn(),
	listMpdProfiles: vi.fn(),
}));

const { resolveCurrentMpdProfile } = await import("./currentMpdProfile.js");
const resolveMock = vi.mocked(resolveCurrentMpdProfile);

beforeEach(() => {
	resolveMock.mockReset();
	resolveMock.mockReturnValue(makeProfile());
});

describe("registerQueueTools / queue_get", () => {
	it("respects the limit argument and reports total separately", async () => {
		const songs = Array.from({ length: 5 }, (_, i) =>
			create(SongSchema, { path: `song-${i}` }),
		);
		const client = makeMpdClient(() =>
			makeMpdResponse({
				command: { case: "playlistinfo", value: { songs } },
			}),
		);
		const server = createFakeMcpServer();
		registerQueueTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("queue_get", { limit: 2 });
		const body = parseToolJson<{
			total: number;
			returned: number;
			songs: { path: string }[];
		}>(result);
		expect(body.total).toBe(5);
		expect(body.returned).toBe(2);
		expect(body.songs).toHaveLength(2);
		expect(body.songs[0]?.path).toBe("song-0");
	});

	it("returns a tool error on unexpected MPD response shape", async () => {
		const client = makeMpdClient(() =>
			makeMpdResponse({ command: { case: "status", value: {} } }),
		);
		const server = createFakeMcpServer();
		registerQueueTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});
		const result = await server.call("queue_get");
		expect(result.isError).toBe(true);
	});
});

describe("registerQueueTools / queue_add", () => {
	it("forwards the URI to the MPD add command", async () => {
		const client = makeMpdClient(() => makeMpdResponse({}));
		const server = createFakeMcpServer();
		registerQueueTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("queue_add", { uri: "songs/foo.flac" });
		expect(result.isError).toBeUndefined();
		const req = (client.execute as unknown as { mock: { calls: unknown[][] } })
			.mock.calls[0]?.[0] as {
			command: { case: string; value: { uri: string } };
		};
		expect(req.command.case).toBe("add");
		expect(req.command.value.uri).toBe("songs/foo.flac");
	});

	it("adds every entry of uris in order and reports the count", async () => {
		const client = makeMpdClient(() => makeMpdResponse({}));
		const server = createFakeMcpServer();
		registerQueueTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("queue_add", {
			uris: ["a.flac", "b.flac", "c.flac"],
		});

		expect(result.isError).toBeUndefined();
		expect(result.content?.[0]).toEqual({
			type: "text",
			text: "added 3 URIs to the queue",
		});
		expect(
			vi.mocked(client.execute).mock.calls.map(([req]) => req.command),
		).toEqual(
			["a.flac", "b.flac", "c.flac"].map((uri) =>
				expect.objectContaining({
					case: "add",
					value: expect.objectContaining({ uri }),
				}),
			),
		);
	});

	it("stops at the first failing entry of uris and names the added count and failing URI", async () => {
		const client = makeMpdClient((req) => {
			if (req.command?.case === "add" && req.command.value.uri === "bad") {
				throw new Error("No such directory");
			}
			return makeMpdResponse({});
		});
		const server = createFakeMcpServer();
		registerQueueTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("queue_add", {
			uris: ["a.flac", "bad", "c.flac"],
		});

		expect(result.isError).toBe(true);
		const block = result.content?.[0];
		if (block?.type !== "text") throw new Error("expected text block");
		expect(block.text).toContain("Added 1 of 3 URIs to the queue");
		expect(block.text).toContain("failed on bad: No such directory");
		expect(client.execute).toHaveBeenCalledTimes(2);
	});

	it("requires exactly one of uri or uris in its input schema", () => {
		const server = createFakeMcpServer();
		registerQueueTools(server as never, {
			mpdClient: makeMpdClient(() => makeMpdResponse({})),
			libraryIndex: makeLibraryIndex(),
		});
		const schema = server.tools.get("queue_add")?.config.inputSchema as {
			safeParse: (v: unknown) => {
				success: boolean;
				error?: { issues: { message: string }[] };
			};
		};

		expect(schema.safeParse({ uri: "a" }).success).toBe(true);
		expect(schema.safeParse({ uris: ["a", "b"] }).success).toBe(true);
		const neither = schema.safeParse({});
		expect(neither.success).toBe(false);
		expect(neither.error?.issues[0]?.message).toBe(
			"Provide exactly one of `uri` or `uris`.",
		);
		expect(schema.safeParse({ uri: "a", uris: ["b"] }).success).toBe(false);
		expect(schema.safeParse({ uris: [] }).success).toBe(false);
	});

	it("returns a tool error when neither uri nor uris reaches the handler", async () => {
		const client = makeMpdClient(() => makeMpdResponse({}));
		const server = createFakeMcpServer();
		registerQueueTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("queue_add", {});

		expect(result.isError).toBe(true);
		expect(client.execute).not.toHaveBeenCalled();
	});
});

describe("registerQueueTools / queue_clear", () => {
	it("issues the MPD clear command", async () => {
		const client = makeMpdClient(() => makeMpdResponse({}));
		const server = createFakeMcpServer();
		registerQueueTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});
		const result = await server.call("queue_clear");
		expect(result.isError).toBeUndefined();
		const req = (client.execute as unknown as { mock: { calls: unknown[][] } })
			.mock.calls[0]?.[0] as { command: { case: string } };
		expect(req.command.case).toBe("clear");
	});
});
