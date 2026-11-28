import { describe, expect, it } from "vitest";

import { parseQueryLimit } from "./queryLimit";

describe("parseQueryLimit", () => {
	it("accepts positive integers", () => {
		expect(parseQueryLimit(50)).toBe(50);
	});

	it("converts integer strings stored by older versions", () => {
		expect(parseQueryLimit("200")).toBe(200);
	});

	it.each([
		"",
		" ",
		"abc",
		"1.5",
		1.5,
		0,
		"0",
		-3,
		Number.NaN,
		Number.POSITIVE_INFINITY,
		undefined,
		null,
	])("rejects %j", (value) => {
		expect(parseQueryLimit(value)).toBeUndefined();
	});
});
