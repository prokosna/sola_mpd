import { create } from "@bufbuild/protobuf";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../mpd";

import { fetchOutputDevices } from "./outputDeviceFetching";

function createMockMpdClient(
	response: Awaited<ReturnType<MpdClient["command"]>>,
): MpdClient {
	return {
		command: vi.fn().mockResolvedValue(response),
		commandBulk: vi.fn(),
	};
}

const profile = create(MpdProfileSchema, {
	name: "test",
	host: "localhost",
	port: 6600,
});

describe("fetchOutputDevices", () => {
	it("should return devices on valid response", async () => {
		const devices = [
			{ id: 0, name: "default", plugin: "pulse", isEnabled: true },
		];
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: "outputs", value: { devices } },
			}),
		);

		const result = await fetchOutputDevices(client, profile);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("default");
	});

	it("should throw on invalid response type", async () => {
		const client = createMockMpdClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);

		await expect(fetchOutputDevices(client, profile)).rejects.toThrow(
			"Invalid MPD response",
		);
	});
});
