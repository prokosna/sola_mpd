import { create } from "@bufbuild/protobuf";
import { MpdPlayerStatusSchema } from "@sola_mpd/shared/src/models/mpd/mpd_player_pb.js";
import { MpdStatsSchema } from "@sola_mpd/shared/src/models/mpd/mpd_stats_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerStatusTools } from "./registerStatusTools.js";
import {
	createFakeMcpServer,
	makeLibraryIndex,
	makeMpdClient,
	makeMpdResponse,
	makeProfile,
	parseToolJson,
} from "./testHelpers.js";

vi.mock("../utils/currentMpdProfile.js", () => ({
	NoCurrentMpdProfileError: class extends Error {
		constructor() {
			super("no profile");
			this.name = "NoCurrentMpdProfileError";
		}
	},
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

describe("registerStatusTools / mpd_status", () => {
	it("merges status and currentsong responses", async () => {
		const client = makeMpdClient((req) => {
			if (req.command?.case === "status") {
				return makeMpdResponse({
					command: {
						case: "status",
						value: {
							status: create(MpdPlayerStatusSchema, {
								playbackState: 1,
								playQueueLength: 5,
							}),
						},
					},
				});
			}
			if (req.command?.case === "currentsong") {
				return makeMpdResponse({
					command: {
						case: "currentsong",
						value: { song: create(SongSchema, { path: "track.flac" }) },
					},
				});
			}
			throw new Error(`unexpected command ${req.command?.case}`);
		});

		const server = createFakeMcpServer();
		registerStatusTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("mpd_status");
		if (result.isError === true) {
			throw new Error(`unexpected error: ${JSON.stringify(result.content)}`);
		}
		expect(client.execute).toHaveBeenCalledTimes(2);
		const body = parseToolJson<{
			playback_state: string;
			queue_length: number;
			current_song?: { path: string };
		}>(result);
		expect(body.playback_state).toBe("PLAY");
		expect(body.queue_length).toBe(5);
		expect(body.current_song?.path).toBe("track.flac");
	});

	it("returns an error tool result when resolveCurrentMpdProfile throws", async () => {
		resolveMock.mockImplementation(() => {
			throw new Error("no profile selected");
		});

		const server = createFakeMcpServer();
		registerStatusTools(server as never, {
			mpdClient: makeMpdClient(() => makeMpdResponse({})),
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("mpd_status");
		expect(result.isError).toBe(true);
	});
});

describe("registerStatusTools / mpd_stats", () => {
	it("wraps the MpdStats payload in toolResultJson", async () => {
		const client = makeMpdClient(() =>
			makeMpdResponse({
				command: {
					case: "stats",
					value: {
						stats: create(MpdStatsSchema, {
							version: "0.23.5",
							artistsCount: 10,
							albumsCount: 5,
							songsCount: 100,
						}),
					},
				},
			}),
		);

		const server = createFakeMcpServer();
		registerStatusTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("mpd_stats");
		if (result.isError === true) {
			throw new Error(`unexpected error: ${JSON.stringify(result.content)}`);
		}
		const body = parseToolJson<{
			artists_count: number;
			albums_count: number;
			songs_count: number;
			version: string;
		}>(result);
		expect(body.artists_count).toBe(10);
		expect(body.albums_count).toBe(5);
		expect(body.songs_count).toBe(100);
		expect(body.version).toBe("0.23.5");
	});

	it("returns an error tool result when the MPD response shape is unexpected", async () => {
		const client = makeMpdClient(() =>
			makeMpdResponse({
				command: { case: "status", value: {} },
			}),
		);

		const server = createFakeMcpServer();
		registerStatusTools(server as never, {
			mpdClient: client,
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("mpd_stats");
		expect(result.isError).toBe(true);
	});
});
