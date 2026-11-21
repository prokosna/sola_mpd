import { describe, expect, it } from "vitest";

import {
	MpdProfileNotFoundError,
	NoCurrentMpdProfileError,
} from "../application/currentMpdProfile.js";
import { errorMessage, errorToToolResult } from "./mcpToolHelpers.js";

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
