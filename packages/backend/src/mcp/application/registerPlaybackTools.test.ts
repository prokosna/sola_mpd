import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerPlaybackTools } from "./registerPlaybackTools.js";
import {
	createFakeMcpServer,
	makeLibraryIndex,
	makeMpdClient,
	makeMpdResponse,
	makeProfile,
} from "./testHelpers.js";

vi.mock("../utils/currentMpdProfile.js", () => ({
	NoCurrentMpdProfileError: class extends Error {},
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

function setupServer() {
	const client = makeMpdClient(() => makeMpdResponse({}));
	const server = createFakeMcpServer();
	registerPlaybackTools(server as never, {
		mpdClient: client,
		libraryIndex: makeLibraryIndex(),
	});
	return { server, client };
}

describe("registerPlaybackTools / playback_control", () => {
	it("dispatches play with the supplied queue_position", async () => {
		const { server, client } = setupServer();
		const result = await server.call("playback_control", {
			action: "play",
			queue_position: 3,
		});
		expect(result.isError).toBeUndefined();
		const req = (client.execute as unknown as { mock: { calls: unknown[][] } })
			.mock.calls[0]?.[0] as {
			command: {
				case: string;
				value: { target: { case: string; value: string } };
			};
		};
		expect(req.command.case).toBe("play");
		expect(req.command.value.target.value).toBe("3");
	});

	it("defaults to queue_position 0 when omitted", async () => {
		const { server, client } = setupServer();
		await server.call("playback_control", { action: "play" });
		const req = (client.execute as unknown as { mock: { calls: unknown[][] } })
			.mock.calls[0]?.[0] as {
			command: { value: { target: { value: string } } };
		};
		expect(req.command.value.target.value).toBe("0");
	});

	it("returns a tool error when seek is called without seek_seconds", async () => {
		const { server, client } = setupServer();
		const result = await server.call("playback_control", { action: "seek" });
		expect(result.isError).toBe(true);
		expect(client.execute).not.toHaveBeenCalled();
	});

	it("sends only the modes that were specified", async () => {
		const { server, client } = setupServer();
		const result = await server.call("playback_set_mode", {
			repeat: true,
			random: false,
		});
		expect(result.isError).toBeUndefined();
		expect(client.execute).toHaveBeenCalledTimes(2);
		const cases = (
			client.execute as unknown as { mock: { calls: unknown[][] } }
		).mock.calls.map(
			(c) =>
				(c[0] as { command: { case: string; value: { enable: boolean } } })
					.command,
		);
		expect(
			cases.map((c) => ({ case: c.case, enable: c.value.enable })),
		).toEqual([
			{ case: "repeat", enable: true },
			{ case: "random", enable: false },
		]);
	});

	it("maps a thrown profile resolution error to a tool error", async () => {
		resolveMock.mockImplementation(() => {
			throw new Error("nope");
		});
		const { server } = setupServer();
		const result = await server.call("playback_control", { action: "pause" });
		expect(result.isError).toBe(true);
	});
});

describe("registerPlaybackTools / playback_set_volume", () => {
	it("issues setvol with the requested level", async () => {
		const { server, client } = setupServer();
		const result = await server.call("playback_set_volume", { volume: 42 });
		expect(result.isError).toBeUndefined();
		const req = (client.execute as unknown as { mock: { calls: unknown[][] } })
			.mock.calls[0]?.[0] as {
			command: { case: string; value: { vol: number } };
		};
		expect(req.command.case).toBe("setvol");
		expect(req.command.value.vol).toBe(42);
	});
});
