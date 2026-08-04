import { create } from "@bufbuild/protobuf";
import {
	type MpdProfile,
	MpdProfileSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NoCurrentMpdProfileError } from "./currentMpdProfile.js";
import { registerProfileTools } from "./registerProfileTools.js";
import {
	createFakeMcpServer,
	makeLibraryIndex,
	makeMpdClient,
	makeMpdResponse,
	parseToolJson,
} from "./testHelpers.js";

vi.mock("./currentMpdProfile.js", () => ({
	NoCurrentMpdProfileError: class NoCurrentMpdProfileError extends Error {
		constructor() {
			super("no profile");
			this.name = "NoCurrentMpdProfileError";
		}
	},
	resolveCurrentMpdProfile: vi.fn(),
	listMpdProfiles: vi.fn(),
}));

const { resolveCurrentMpdProfile, listMpdProfiles } = await import(
	"./currentMpdProfile.js"
);
const resolveMock = vi.mocked(resolveCurrentMpdProfile);
const listMock = vi.mocked(listMpdProfiles);

function profile(
	name: string,
	host = `${name}.local`,
	port = 6600,
): MpdProfile {
	return create(MpdProfileSchema, { name, host, port });
}

beforeEach(() => {
	resolveMock.mockReset();
	listMock.mockReset();
});

describe("registerProfileTools / mpd_profiles", () => {
	it("returns the default profile alongside the full list", async () => {
		const a = profile("a");
		const b = profile("b");
		listMock.mockReturnValue([a, b]);
		resolveMock.mockReturnValue(b);

		const server = createFakeMcpServer();
		registerProfileTools(server as never, {
			mpdClient: makeMpdClient(() => makeMpdResponse({})),
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("mpd_profiles");
		const body = parseToolJson<{
			default_profile: { name: string; host: string; port: number } | null;
			profiles: { name: string }[];
		}>(result);
		expect(body.default_profile?.name).toBe("b");
		expect(body.profiles.map((p) => p.name)).toEqual(["a", "b"]);
	});

	it("reports default_profile=undefined when no profile is selected", async () => {
		listMock.mockReturnValue([profile("a")]);
		resolveMock.mockImplementation(() => {
			throw new NoCurrentMpdProfileError();
		});

		const server = createFakeMcpServer();
		registerProfileTools(server as never, {
			mpdClient: makeMpdClient(() => makeMpdResponse({})),
			libraryIndex: makeLibraryIndex(),
		});

		const result = await server.call("mpd_profiles");
		const body = parseToolJson<{ default_profile: unknown }>(result);
		expect(body.default_profile).toBeUndefined();
	});
});
