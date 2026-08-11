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
