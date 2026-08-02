import { describe, expect, it } from "vitest";
import { computeViewStateBlobToken } from "./computeViewStateBlobToken.js";

describe("computeViewStateBlobToken", () => {
	it("is deterministic for the same input", () => {
		const data = JSON.stringify({ tag: "ARTIST", values: ["a", "b", "c"] });

		expect(computeViewStateBlobToken(data)).toBe(
			computeViewStateBlobToken(data),
		);
	});

	it("produces different tokens for different inputs", () => {
		const tokenA = computeViewStateBlobToken("selection-a");
		const tokenB = computeViewStateBlobToken("selection-b");

		expect(tokenA).not.toBe(tokenB);
	});

	it("returns a 16-character lowercase hex digest", () => {
		const token = computeViewStateBlobToken("some payload");

		expect(token).toMatch(/^[0-9a-f]{16}$/);
	});
});
