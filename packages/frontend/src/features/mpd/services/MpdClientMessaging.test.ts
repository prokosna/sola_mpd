import { create, toBinary } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import { MpdCommandError } from "../types/MpdCommandError";
import { MpdClientMessaging } from "./MpdClientMessaging";

const createMessagingClient = (
	overrides: Partial<MessagingClient>,
): MessagingClient => ({
	isReady: vi.fn(),
	fetch: vi.fn(),
	emit: vi.fn(),
	on: vi.fn(),
	off: vi.fn(),
	onReconnect: vi.fn(),
	onDisconnect: vi.fn(() => () => {}),
	...overrides,
});

const request = create(MpdRequestSchema, {
	command: { case: "play", value: {} },
});

describe("MpdClientMessaging", () => {
	it("rejects with MpdCommandError on an error response", async () => {
		const client = createMessagingClient({
			fetch: vi.fn(async (_event, _payload, fromBinary) =>
				fromBinary(
					toBinary(
						MpdResponseSchema,
						create(MpdResponseSchema, {
							command: { case: "error", value: { message: "no such song" } },
						}),
					),
				),
			) as MessagingClient["fetch"],
		});

		const result = new MpdClientMessaging(client).command(request);

		await expect(result).rejects.toBeInstanceOf(MpdCommandError);
		await expect(result).rejects.toThrow("no such song");
	});

	it("rejects with MpdCommandError when the transport fails", async () => {
		const cause = new Error("operation has timed out");
		const client = createMessagingClient({
			fetch: vi.fn().mockRejectedValue(cause),
		});

		const result = new MpdClientMessaging(client).command(request);

		await expect(result).rejects.toBeInstanceOf(MpdCommandError);
		await expect(result).rejects.toMatchObject({
			name: "MpdCommandError",
			message: "operation has timed out",
			cause,
		});
	});

	it("rejects a failed bulk command with MpdCommandError", async () => {
		const client = createMessagingClient({
			emit: vi.fn().mockRejectedValue(new Error("connection refused")),
		});

		const result = new MpdClientMessaging(client).commandBulk([request]);

		await expect(result).rejects.toBeInstanceOf(MpdCommandError);
		await expect(result).rejects.toThrow("connection refused");
	});
});
