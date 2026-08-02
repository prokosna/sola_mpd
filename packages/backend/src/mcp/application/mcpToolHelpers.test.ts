import { describe, expect, it } from "vitest";

import {
	MpdProfileNotFoundError,
	NoCurrentMpdProfileError,
} from "../utils/currentMpdProfile.js";
import { errorToToolResult, executeMpdCommand } from "./mcpToolHelpers.js";
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
