import { describe, expect, it } from "vitest";

import {
	BROWSER_SELECTION_QUERY_PARAM,
	RECENTLY_ADDED_SELECTION_QUERY_PARAM,
	VIEW_STATE_BLOB_QUERY_PARAM,
} from "../const/browsingSelectionQueryParams";
import { applySelectionQueryParam } from "./applySelectionQueryParam";

describe("applySelectionQueryParam", () => {
	it("sets the inline param when given an inline result", () => {
		const next = applySelectionQueryParam(
			new URLSearchParams(),
			BROWSER_SELECTION_QUERY_PARAM,
			{ key: BROWSER_SELECTION_QUERY_PARAM, value: "abc" },
		);

		expect(next.get(BROWSER_SELECTION_QUERY_PARAM)).toBe("abc");
		expect(next.has(VIEW_STATE_BLOB_QUERY_PARAM)).toBe(false);
	});

	it("clears both params when the selection is empty", () => {
		const prev = new URLSearchParams({
			[BROWSER_SELECTION_QUERY_PARAM]: "abc",
			[VIEW_STATE_BLOB_QUERY_PARAM]: "token",
		});

		const next = applySelectionQueryParam(
			prev,
			BROWSER_SELECTION_QUERY_PARAM,
			undefined,
		);

		expect(next.has(BROWSER_SELECTION_QUERY_PARAM)).toBe(false);
		expect(next.has(VIEW_STATE_BLOB_QUERY_PARAM)).toBe(false);
	});

	// The two forms are mutually exclusive: whichever one was there has to go
	// before the new one is written, or a stale inline value would outlive the
	// token that replaced it (and vice versa).
	it("drops a stale inline value when the result is a blob token", () => {
		const prev = new URLSearchParams({
			[BROWSER_SELECTION_QUERY_PARAM]: "stale",
		});

		const next = applySelectionQueryParam(prev, BROWSER_SELECTION_QUERY_PARAM, {
			key: VIEW_STATE_BLOB_QUERY_PARAM,
			value: "token",
		});

		expect(next.has(BROWSER_SELECTION_QUERY_PARAM)).toBe(false);
		expect(next.get(VIEW_STATE_BLOB_QUERY_PARAM)).toBe("token");
	});

	it("drops a stale blob token when the result is inline", () => {
		const prev = new URLSearchParams({
			[VIEW_STATE_BLOB_QUERY_PARAM]: "stale-token",
		});

		const next = applySelectionQueryParam(prev, BROWSER_SELECTION_QUERY_PARAM, {
			key: BROWSER_SELECTION_QUERY_PARAM,
			value: "abc",
		});

		expect(next.has(VIEW_STATE_BLOB_QUERY_PARAM)).toBe(false);
		expect(next.get(BROWSER_SELECTION_QUERY_PARAM)).toBe("abc");
	});

	// Browser and Recently Added each own an inline param, so updating one page
	// must leave the other page's position alone.
	it("leaves the other page's selection param untouched", () => {
		const prev = new URLSearchParams({
			[RECENTLY_ADDED_SELECTION_QUERY_PARAM]: "other",
		});

		const next = applySelectionQueryParam(prev, BROWSER_SELECTION_QUERY_PARAM, {
			key: BROWSER_SELECTION_QUERY_PARAM,
			value: "abc",
		});

		expect(next.get(RECENTLY_ADDED_SELECTION_QUERY_PARAM)).toBe("other");
	});

	it("does not mutate the input params", () => {
		const prev = new URLSearchParams({
			[BROWSER_SELECTION_QUERY_PARAM]: "abc",
		});

		applySelectionQueryParam(prev, BROWSER_SELECTION_QUERY_PARAM, undefined);

		expect(prev.get(BROWSER_SELECTION_QUERY_PARAM)).toBe("abc");
	});
});
