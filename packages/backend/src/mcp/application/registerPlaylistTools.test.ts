import { create } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { PlaylistSchema } from "@sola_mpd/shared/src/models/playlist_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerPlaylistTools } from "./registerPlaylistTools.js";
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

describe("registerPlaylistTools / playlist_list", () => {
	it("returns playlist names and ISO updated_at, falling back to null when timestamp missing", async () => {
		const client = makeMpdClient(() =>
			makeMpdResponse({
				command: {
					case: "listplaylists",
					value: {
						playlists: [
							create(PlaylistSchema, {
								name: "alpha",
								updatedAt: timestampFromDate(
									new Date("2025-05-22T12:00:00.000Z"),
								),
							}),
							create(PlaylistSchema, { name: "no-ts" }),
						],
					},
				},
			}),
		);
		const server = createFakeMcpServer();
		registerPlaylistTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("playlist_list");
		const body = parseToolJson<{
			playlists: { name: string; updated_at: string | null }[];
		}>(result);
		expect(body.playlists).toEqual([
			{ name: "alpha", updated_at: "2025-05-22T12:00:00.000Z" },
			{ name: "no-ts", updated_at: null },
		]);
	});
});

describe("registerPlaylistTools / playlist_get", () => {
	it("returns the songs of the requested playlist", async () => {
		const songs = [
			create(SongSchema, { path: "p/song-1" }),
			create(SongSchema, { path: "p/song-2" }),
		];
		const client = makeMpdClient((req) => {
			expect(req.command?.case).toBe("listplaylistinfo");
			return makeMpdResponse({
				command: { case: "listplaylistinfo", value: { songs } },
			});
		});
		const server = createFakeMcpServer();
		registerPlaylistTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("playlist_get", { name: "p" });
		const body = parseToolJson<{
			name: string;
			songs: { path: string }[];
		}>(result);
		expect(body.name).toBe("p");
		expect(body.songs.map((s) => s.path)).toEqual(["p/song-1", "p/song-2"]);
	});
});

function textOf(result: { content?: unknown[] }): string {
	const block = result.content?.[0] as { type?: string; text?: string };
	if (block?.type !== "text" || block.text === undefined) {
		throw new Error("expected text block");
	}
	return block.text;
}

function sentCommands(client: ReturnType<typeof makeMpdClient>) {
	return vi.mocked(client.execute).mock.calls.map(([req]) => req.command);
}

function setup(client: ReturnType<typeof makeMpdClient>) {
	const server = createFakeMcpServer();
	registerPlaylistTools(server as never, {
		mpdClient: client,
		libraryIndex: makeLibraryIndex(),
	});
	return server;
}

describe("registerPlaylistTools / playlist_add", () => {
	it("appends every URI in order and reports the count", async () => {
		const client = makeMpdClient(() =>
			makeMpdResponse({ command: { case: "playlistadd", value: {} } }),
		);
		const server = setup(client);

		const result = await server.call("playlist_add", {
			name: "mix",
			uris: ["a.flac", "b.flac", "c.flac"],
		});

		expect(result.isError).toBeUndefined();
		expect(textOf(result)).toBe('added 3 URIs to playlist "mix"');
		expect(sentCommands(client)).toEqual(
			["a.flac", "b.flac", "c.flac"].map((uri) =>
				expect.objectContaining({
					case: "playlistadd",
					value: expect.objectContaining({ name: "mix", uri }),
				}),
			),
		);
	});

	it("stops at the first failure and names the added count and failing URI", async () => {
		const client = makeMpdClient((req) => {
			if (
				req.command?.case === "playlistadd" &&
				req.command.value.uri === "missing.flac"
			) {
				throw new Error("ACK [50@0] {playlistadd} No such song");
			}
			return makeMpdResponse({ command: { case: "playlistadd", value: {} } });
		});
		const server = setup(client);

		const result = await server.call("playlist_add", {
			name: "mix",
			uris: ["a.flac", "missing.flac", "c.flac"],
		});

		expect(result.isError).toBe(true);
		const text = textOf(result);
		expect(text).toContain('Added 1 of 3 URIs to playlist "mix"');
		expect(text).toContain("failed on missing.flac");
		expect(text).toContain("No such song");
		expect(client.execute).toHaveBeenCalledTimes(2);
	});

	it("returns the profile resolution error without calling MPD", async () => {
		resolveMock.mockImplementation(() => {
			throw new Error("No default MPD profile");
		});
		const client = makeMpdClient(() => makeMpdResponse({}));
		const server = setup(client);

		const result = await server.call("playlist_add", {
			name: "mix",
			uris: ["a.flac"],
		});

		expect(result.isError).toBe(true);
		expect(textOf(result)).toBe("No default MPD profile");
		expect(client.execute).not.toHaveBeenCalled();
	});

	it("rejects an empty uris array in its input schema", () => {
		const server = setup(makeMpdClient(() => makeMpdResponse({})));
		const schema = server.tools.get("playlist_add")?.config.inputSchema as {
			safeParse: (v: unknown) => { success: boolean };
		};

		expect(schema.safeParse({ name: "mix", uris: [] }).success).toBe(false);
		expect(schema.safeParse({ name: "mix", uris: ["a"] }).success).toBe(true);
	});
});

describe("registerPlaylistTools / playlist_save_queue", () => {
	it("sends save with the requested name", async () => {
		const client = makeMpdClient(() =>
			makeMpdResponse({ command: { case: "save", value: {} } }),
		);
		const server = setup(client);

		const result = await server.call("playlist_save_queue", { name: "new" });

		expect(result.isError).toBeUndefined();
		expect(textOf(result)).toBe('queue saved as playlist "new"');
		expect(sentCommands(client)).toEqual([
			expect.objectContaining({
				case: "save",
				value: expect.objectContaining({ name: "new" }),
			}),
		]);
	});

	it("surfaces MPD's error when the playlist already exists", async () => {
		const client = makeMpdClient(() => {
			throw new Error("ACK [56@0] {save} Playlist already exists");
		});
		const server = setup(client);

		const result = await server.call("playlist_save_queue", { name: "old" });

		expect(result.isError).toBe(true);
		const text = textOf(result);
		expect(text).toContain('Failed to save the queue as playlist "old"');
		expect(text).toContain("Playlist already exists");
	});
});

describe("registerPlaylistTools / playlist_load", () => {
	it("adds every song of the playlist to the queue in order", async () => {
		const songs = ["x/1.flac", "x/2.flac"].map((path) =>
			create(SongSchema, { path }),
		);
		const client = makeMpdClient((req) =>
			req.command?.case === "listplaylistinfo"
				? makeMpdResponse({
						command: { case: "listplaylistinfo", value: { songs } },
					})
				: makeMpdResponse({ command: { case: "add", value: {} } }),
		);
		const server = setup(client);

		const result = await server.call("playlist_load", { name: "x" });

		expect(result.isError).toBeUndefined();
		expect(textOf(result)).toBe('added 2 songs from playlist "x" to the queue');
		expect(sentCommands(client)).toEqual([
			expect.objectContaining({
				case: "listplaylistinfo",
				value: expect.objectContaining({ name: "x" }),
			}),
			expect.objectContaining({
				case: "add",
				value: expect.objectContaining({ uri: "x/1.flac" }),
			}),
			expect.objectContaining({
				case: "add",
				value: expect.objectContaining({ uri: "x/2.flac" }),
			}),
		]);
	});

	it("reports zero added for an empty playlist", async () => {
		const client = makeMpdClient(() =>
			makeMpdResponse({
				command: { case: "listplaylistinfo", value: { songs: [] } },
			}),
		);
		const server = setup(client);

		const result = await server.call("playlist_load", { name: "empty" });

		expect(textOf(result)).toBe(
			'added 0 songs from playlist "empty" to the queue',
		);
		expect(client.execute).toHaveBeenCalledOnce();
	});

	it("stops at the first failing add and names the added count and failing URI", async () => {
		const songs = ["1.flac", "gone.flac", "3.flac"].map((path) =>
			create(SongSchema, { path }),
		);
		const client = makeMpdClient((req) => {
			if (req.command?.case === "listplaylistinfo") {
				return makeMpdResponse({
					command: { case: "listplaylistinfo", value: { songs } },
				});
			}
			if (
				req.command?.case === "add" &&
				req.command.value.uri === "gone.flac"
			) {
				throw new Error("ACK [50@0] {add} No such directory");
			}
			return makeMpdResponse({ command: { case: "add", value: {} } });
		});
		const server = setup(client);

		const result = await server.call("playlist_load", { name: "p" });

		expect(result.isError).toBe(true);
		const text = textOf(result);
		expect(text).toContain('Added 1 of 3 songs from playlist "p"');
		expect(text).toContain("failed on gone.flac");
		expect(text).toContain("No such directory");
		expect(client.execute).toHaveBeenCalledTimes(3);
	});

	it("returns MPD's error when the playlist does not exist", async () => {
		const client = makeMpdClient(() => {
			throw new Error("ACK [50@0] {listplaylistinfo} No such playlist");
		});
		const server = setup(client);

		const result = await server.call("playlist_load", { name: "nope" });

		expect(result.isError).toBe(true);
		expect(textOf(result)).toContain("No such playlist");
		expect(client.execute).toHaveBeenCalledOnce();
	});

	it("returns a tool error on unexpected MPD response shape", async () => {
		const client = makeMpdClient(() =>
			makeMpdResponse({ command: { case: "status", value: {} } }),
		);
		const server = setup(client);

		const result = await server.call("playlist_load", { name: "x" });

		expect(result.isError).toBe(true);
		expect(textOf(result)).toContain("listplaylistinfo");
		expect(client.execute).toHaveBeenCalledOnce();
	});
});
