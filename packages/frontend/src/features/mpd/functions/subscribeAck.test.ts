import { create, toBinary } from "@bufbuild/protobuf";
import { MpdResponseSchema } from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { describe, expect, it } from "vitest";

import { getSubscribeAckError } from "./subscribeAck";

describe("getSubscribeAckError", () => {
	it("treats an empty acknowledgement as success", () => {
		expect(getSubscribeAckError(new Uint8Array(0))).toBeUndefined();
	});

	it("returns the message of an encoded error", () => {
		const ack = toBinary(
			MpdResponseSchema,
			create(MpdResponseSchema, {
				command: { case: "error", value: { message: "MPD is down" } },
			}),
		);

		expect(getSubscribeAckError(ack)).toBe("MPD is down");
	});

	it("reports a payload that is not an MpdResponse", () => {
		expect(getSubscribeAckError(new Uint8Array([0xff, 0xff]))).toBeDefined();
	});
});
