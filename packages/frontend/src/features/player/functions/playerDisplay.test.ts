import { describe, expect, it } from "vitest";

import { getElapsedTimePercentage } from "./playerDisplay";

describe("playerDisplay", () => {
	describe("getElapsedTimePercentage", () => {
		it("should return percentage of elapsed time", () => {
			expect(getElapsedTimePercentage(50, 200)).toBe(25);
		});

		it("should return 100 when elapsed equals duration", () => {
			expect(getElapsedTimePercentage(100, 100)).toBe(100);
		});

		it("should return 0 when elapsed is 0", () => {
			expect(getElapsedTimePercentage(0, 100)).toBe(0);
		});

		it("should return -1 when duration is undefined", () => {
			expect(getElapsedTimePercentage(50, undefined)).toBe(-1);
		});

		it("should return -1 when elapsed is undefined", () => {
			expect(getElapsedTimePercentage(undefined, 100)).toBe(-1);
		});

		it("should return -1 when duration is 0", () => {
			expect(getElapsedTimePercentage(50, 0)).toBe(-1);
		});

		it("should return -1 when both are undefined", () => {
			expect(getElapsedTimePercentage(undefined, undefined)).toBe(-1);
		});
	});
});
