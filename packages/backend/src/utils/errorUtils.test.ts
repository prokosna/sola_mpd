import { describe, expect, it } from "vitest";

import { toErrorMessage } from "./errorUtils.js";

describe("toErrorMessage", () => {
	it("returns the string itself when given a string", () => {
		expect(toErrorMessage("boom")).toBe("boom");
	});

	it("returns an empty string when given an empty string", () => {
		expect(toErrorMessage("")).toBe("");
	});

	it("returns the message when given an Error instance", () => {
		expect(toErrorMessage(new Error("failed to connect"))).toBe(
			"failed to connect",
		);
	});

	it("returns the message for Error subclasses", () => {
		class CustomError extends Error {}
		expect(toErrorMessage(new CustomError("custom"))).toBe("custom");
	});

	it.each([
		["undefined", undefined],
		["null", null],
		["number", 42],
		["boolean", true],
		["plain object", { reason: "bad" }],
		["array", ["a", "b"]],
	])("returns 'Unknown error' for non-string non-Error input (%s)", (_, input) => {
		expect(toErrorMessage(input)).toBe("Unknown error");
	});
});
