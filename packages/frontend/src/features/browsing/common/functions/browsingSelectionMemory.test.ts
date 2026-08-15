import { describe, expect, it } from "vitest";

import {
	BROWSER_SELECTION_QUERY_PARAM,
	RECENTLY_ADDED_SELECTION_QUERY_PARAM,
	VIEW_STATE_BLOB_QUERY_PARAM,
} from "../const/browsingSelectionQueryParams";

import {
	readSelectionQueryParam,
	shouldHydrateFromMemory,
} from "./browsingSelectionMemory";

describe("readSelectionQueryParam", () => {
	it("returns undefined when the query string has no relevant params", () => {
		expect(readSelectionQueryParam("", BROWSER_SELECTION_QUERY_PARAM)).toBe(
			undefined,
		);
		expect(
			readSelectionQueryParam("?other=1", BROWSER_SELECTION_QUERY_PARAM),
		).toBe(undefined);
	});

	it("treats an empty inline value as absent", () => {
		expect(
			readSelectionQueryParam(
				`?${BROWSER_SELECTION_QUERY_PARAM}=`,
				BROWSER_SELECTION_QUERY_PARAM,
			),
		).toBe(undefined);
	});

	it("returns the inline param when present", () => {
		expect(
			readSelectionQueryParam(
				`?${BROWSER_SELECTION_QUERY_PARAM}=abc`,
				BROWSER_SELECTION_QUERY_PARAM,
			),
		).toEqual({ key: BROWSER_SELECTION_QUERY_PARAM, value: "abc" });
	});

	it("returns the blob token when present", () => {
		expect(
			readSelectionQueryParam("?vs=token1", BROWSER_SELECTION_QUERY_PARAM),
		).toEqual({ key: VIEW_STATE_BLOB_QUERY_PARAM, value: "token1" });
	});

	it("prefers the blob token over an inline value if both are present", () => {
		expect(
			readSelectionQueryParam(
				`?${BROWSER_SELECTION_QUERY_PARAM}=abc&vs=token1`,
				BROWSER_SELECTION_QUERY_PARAM,
			),
		).toEqual({ key: VIEW_STATE_BLOB_QUERY_PARAM, value: "token1" });
	});

	it("only reads the given page's own inline param", () => {
		expect(
			readSelectionQueryParam(
				`?${RECENTLY_ADDED_SELECTION_QUERY_PARAM}=abc`,
				BROWSER_SELECTION_QUERY_PARAM,
			),
		).toBe(undefined);
	});
});

describe("shouldHydrateFromMemory", () => {
	it("hydrates when the URL is bare and memory holds a value", () => {
		expect(
			shouldHydrateFromMemory(undefined, {
				key: BROWSER_SELECTION_QUERY_PARAM,
				value: "abc",
			}),
		).toBe(true);
	});

	it("does not hydrate when the URL already carries a param", () => {
		expect(
			shouldHydrateFromMemory(
				{ key: BROWSER_SELECTION_QUERY_PARAM, value: "abc" },
				{ key: BROWSER_SELECTION_QUERY_PARAM, value: "def" },
			),
		).toBe(false);
	});

	it("does not hydrate when memory is empty", () => {
		expect(shouldHydrateFromMemory(undefined, undefined)).toBe(false);
	});
});
