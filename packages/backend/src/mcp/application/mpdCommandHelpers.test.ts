import { describe, expect, it } from "vitest";

import {
	executeMpdCommand,
	executeMpdCommandsSequentially,
} from "./mpdCommandHelpers.js";
import { makeMpdClient, makeMpdResponse, makeProfile } from "./testHelpers.js";

describe("executeMpdCommand", () => {
	it("builds an MpdRequest containing the profile and command and delegates to MpdClient.execute", async () => {
		const profile = makeProfile();
		const response = makeMpdResponse({
			command: { case: "stats", value: { stats: {} } },
		});
		const client = makeMpdClient(() => response);

		const result = await executeMpdCommand(client, profile, {
			case: "stats",
			value: {},
		});

		expect(result).toBe(response);
		expect(client.execute).toHaveBeenCalledOnce();
		const sentRequest = (
			client.execute as unknown as { mock: { calls: unknown[][] } }
		).mock.calls[0]?.[0] as { profile?: unknown; command?: { case: string } };
		expect(sentRequest?.profile).toEqual(profile);
		expect(sentRequest?.command?.case).toBe("stats");
	});
});

describe("executeMpdCommandsSequentially", () => {
	it("runs every command in order and reports them all completed", async () => {
		const client = makeMpdClient(() => makeMpdResponse({}));

		const result = await executeMpdCommandsSequentially(client, makeProfile(), [
			{ case: "add", value: { uri: "a" } },
			{ case: "add", value: { uri: "b" } },
		]);

		expect(result).toEqual({ completed: 2 });
		expect(client.execute).toHaveBeenCalledTimes(2);
	});

	it("stops at the first failure and reports its index and error", async () => {
		const error = new Error("boom");
		const client = makeMpdClient((req) => {
			if (req.command?.case === "add" && req.command.value.uri === "b") {
				throw error;
			}
			return makeMpdResponse({});
		});

		const result = await executeMpdCommandsSequentially(client, makeProfile(), [
			{ case: "add", value: { uri: "a" } },
			{ case: "add", value: { uri: "b" } },
			{ case: "add", value: { uri: "c" } },
		]);

		expect(result).toEqual({
			completed: 1,
			failure: { index: 1, error },
		});
		expect(client.execute).toHaveBeenCalledTimes(2);
	});

	it("returns zero completed for an empty command list", async () => {
		const client = makeMpdClient(() => makeMpdResponse({}));

		const result = await executeMpdCommandsSequentially(
			client,
			makeProfile(),
			[],
		);

		expect(result).toEqual({ completed: 0 });
		expect(client.execute).not.toHaveBeenCalled();
	});
});
