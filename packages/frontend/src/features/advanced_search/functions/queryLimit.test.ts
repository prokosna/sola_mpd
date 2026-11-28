import { describe, expect, it } from "vitest";

import { parseQueryLimit } from "./queryLimit";

describe("parseQueryLimit", () => {
	it("accepts positive integers", () => {
		expect(parseQueryLimit(50)).toBe(50);
	});

	it("accepts the int32 maximum", () => {
		expect(parseQueryLimit(2147483647)).toBe(2147483647);
		expect(parseQueryLimit("2147483647")).toBe(2147483647);
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
		2147483648,
		"2147483648",
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
