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
