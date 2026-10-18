import { describe, expect, it } from "vitest";

import {
	RESUBSCRIBE_INITIAL_DELAY_MS,
	RESUBSCRIBE_MAX_DELAY_MS,
} from "../const/resubscribeBackoff";
import { getResubscribeDelayMs } from "./resubscribeBackoff";

describe("getResubscribeDelayMs", () => {
	it("starts at the initial delay", () => {
		expect(getResubscribeDelayMs(0)).toBe(RESUBSCRIBE_INITIAL_DELAY_MS);
	});

	it("doubles with each attempt", () => {
		expect(getResubscribeDelayMs(1)).toBe(RESUBSCRIBE_INITIAL_DELAY_MS * 2);
		expect(getResubscribeDelayMs(3)).toBe(RESUBSCRIBE_INITIAL_DELAY_MS * 8);
	});

	it("is capped at the maximum delay", () => {
		expect(getResubscribeDelayMs(5)).toBe(RESUBSCRIBE_MAX_DELAY_MS);
		expect(getResubscribeDelayMs(1_000)).toBe(RESUBSCRIBE_MAX_DELAY_MS);
	});

	it("treats a negative attempt as the first one", () => {
		expect(getResubscribeDelayMs(-1)).toBe(RESUBSCRIBE_INITIAL_DELAY_MS);
	});
});
