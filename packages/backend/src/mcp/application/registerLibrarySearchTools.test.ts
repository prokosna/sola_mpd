import { create } from "@bufbuild/protobuf";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerLibrarySearchTools } from "./registerLibrarySearchTools.js";
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

describe("registerLibrarySearchTools / library_list_tag_values", () => {
	it("trims to the requested limit and reports total separately", async () => {
		const values = ["a", "b", "c", "d", "e"];
		const client = makeMpdClient(() =>
			makeMpdResponse({
				command: { case: "list", value: { values } },
			}),
		);
		const server = createFakeMcpServer();
		registerLibrarySearchTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("library_list_tag_values", {
			tag: "artist",
			limit: 2,
		});
		const body = parseToolJson<{
			total: number;
			returned: number;
			values: string[];
		}>(result);
		expect(body.total).toBe(5);
		expect(body.returned).toBe(2);
		expect(body.values).toEqual(["a", "b"]);
	});
});

describe("registerLibrarySearchTools / library_search", () => {
	it("rejects when the filter object has no usable keys", async () => {
		const client = makeMpdClient(() => makeMpdResponse({}));
		const server = createFakeMcpServer();
		registerLibrarySearchTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("library_search", { filter: {} });
		expect(result.isError).toBe(true);
		expect(client.execute).not.toHaveBeenCalled();
	});

	it("passes pagination and returns flattened songs", async () => {
		const songs = [
			create(SongSchema, { path: "lib/a" }),
			create(SongSchema, { path: "lib/b" }),
		];
		const client = makeMpdClient(() =>
			makeMpdResponse({ command: { case: "search", value: { songs } } }),
		);
		const server = createFakeMcpServer();
		registerLibrarySearchTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("library_search", {
			filter: { artist: "x" },
			limit: 10,
			offset: 5,
		});
		const body = parseToolJson<{
			returned: number;
			offset: number;
			songs: { path: string }[];
		}>(result);
		expect(body.returned).toBe(2);
		expect(body.offset).toBe(5);
		expect(body.songs.map((s) => s.path)).toEqual(["lib/a", "lib/b"]);

		const req = (client.execute as unknown as { mock: { calls: unknown[][] } })
			.mock.calls[0]?.[0] as {
			command: {
				case: string;
				value: { window: { start: number; end: number } };
			};
		};
		expect(req.command.case).toBe("search");
		expect(req.command.value.window.start).toBe(5);
		expect(req.command.value.window.end).toBe(15);
	});
});
