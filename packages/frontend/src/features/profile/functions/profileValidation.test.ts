import { create } from "@bufbuild/protobuf";
import {
	MpdCommand_Connection_PingResponseSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import { describe, expect, it, vi } from "vitest";

import type { MpdClient } from "../../mpd";
import type { ProfileInput } from "../types/profileTypes";

import {
	createValidationResult,
	validateMpdProfile,
} from "./profileValidation";

function createMockClient(
	response: Awaited<ReturnType<MpdClient["command"]>>,
): MpdClient {
	return {
		command: vi.fn().mockResolvedValue(response),
		commandBulk: vi.fn(),
	};
}

function createRejectingClient(error: Error): MpdClient {
	return {
		command: vi.fn().mockRejectedValue(error),
		commandBulk: vi.fn(),
	};
}

const validInput: ProfileInput = {
	name: "New Profile",
	host: "localhost",
	port: 6600,
};

describe("createValidationResult", () => {
	it("should create a valid result", () => {
		const result = createValidationResult(true);
		expect(result.isValid).toBe(true);
		expect(result.message).toBeUndefined();
	});

	it("should create an invalid result with message", () => {
		const result = createValidationResult(false, "Error occurred");
		expect(result.isValid).toBe(false);
		expect(result.message).toBe("Error occurred");
	});
});

describe("validateMpdProfile", () => {
	it("should reject when mpdClient is undefined", async () => {
		const result = await validateMpdProfile(undefined, [], validInput);
		expect(result.isValid).toBe(false);
		expect(result.message).toContain("MpdClient is not ready");
	});

	it("should reject when profile name is already used", async () => {
		const client = createMockClient(create(MpdResponseSchema));
		const result = await validateMpdProfile(
			client,
			["New Profile"],
			validInput,
		);
		expect(result.isValid).toBe(false);
		expect(result.message).toContain("already used");
	});

	it("should reject when host is empty", async () => {
		const client = createMockClient(create(MpdResponseSchema));
		const input: ProfileInput = { ...validInput, host: "" };
		const result = await validateMpdProfile(client, [], input);
		expect(result.isValid).toBe(false);
		expect(result.message).toBe("Host is required.");
	});

	it("should reject when MPD version is too old", async () => {
		const client = createMockClient(
			create(MpdResponseSchema, {
				command: {
					case: "ping",
					value: create(MpdCommand_Connection_PingResponseSchema, {
						version: "0.20.0",
					}),
				},
			}),
		);
		const result = await validateMpdProfile(client, [], validInput);
		expect(result.isValid).toBe(false);
		expect(result.message).toContain("0.21 or later");
	});

	it("should accept when version is 0.21 or later", async () => {
		const client = createMockClient(
			create(MpdResponseSchema, {
				command: {
					case: "ping",
					value: create(MpdCommand_Connection_PingResponseSchema, {
						version: "0.23.5",
					}),
				},
			}),
		);
		const result = await validateMpdProfile(client, [], validInput);
		expect(result.isValid).toBe(true);
	});

	it("should reject on invalid MPD response type", async () => {
		const client = createMockClient(
			create(MpdResponseSchema, {
				command: { case: undefined, value: undefined },
			}),
		);
		const result = await validateMpdProfile(client, [], validInput);
		expect(result.isValid).toBe(false);
		expect(result.message).toContain("Invalid MPD response");
	});

	it("should handle connection errors", async () => {
		const client = createRejectingClient(new Error("Connection refused"));
		const result = await validateMpdProfile(client, [], validInput);
		expect(result.isValid).toBe(false);
		expect(result.message).toContain("Connection refused");
	});
});
