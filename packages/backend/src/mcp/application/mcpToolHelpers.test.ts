import { describe, expect, it } from "vitest";

import {
	MpdProfileNotFoundError,
	NoCurrentMpdProfileError,
} from "./currentMpdProfile.js";
import {
	errorMessage,
	errorToToolResult,
	executeMpdCommand,
	executeMpdCommandsSequentially,
} from "./mcpToolHelpers.js";
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

describe("errorMessage", () => {
	it("uses Error.message and stringifies other throwables", () => {
		expect(errorMessage(new Error("boom"))).toBe("boom");
		expect(errorMessage("plain")).toBe("plain");
	});
});

describe("errorToToolResult", () => {
	it("preserves the NoCurrentMpdProfileError message as the tool error text", () => {
		const result = errorToToolResult(new NoCurrentMpdProfileError());
		expect(result.isError).toBe(true);
		const block = result.content?.[0];
		if (block?.type !== "text") throw new Error("expected text block");
		expect(block.text).toContain("No default MPD profile");
	});

	it("preserves the MpdProfileNotFoundError message as the tool error text", () => {
		const result = errorToToolResult(new MpdProfileNotFoundError("bogus"));
		expect(result.isError).toBe(true);
		const block = result.content?.[0];
		if (block?.type !== "text") throw new Error("expected text block");
		expect(block.text).toContain("bogus");
		expect(block.text).toContain("mpd_profiles");
	});

	it("uses Error.message for generic errors", () => {
		const result = errorToToolResult(new Error("boom"));
		expect(result.isError).toBe(true);
		const block = result.content?.[0];
		if (block?.type !== "text") throw new Error("expected text block");
		expect(block.text).toBe("boom");
	});

	it("stringifies non-Error throwables", () => {
		const result = errorToToolResult("string-error");
		const block = result.content?.[0];
		if (block?.type !== "text") throw new Error("expected text block");
		expect(block.text).toBe("string-error");
	});
});
