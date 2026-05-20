import { convertConditionsToString } from "@sola_mpd/shared/src/functions/mpdConverters.js";
import { FilterCondition_Operator } from "@sola_mpd/shared/src/models/filter_pb.js";
import { describe, expect, it } from "vitest";

import { buildSearchConditions } from "./buildSearchConditions.js";

describe("buildSearchConditions", () => {
	it("returns empty array for empty input", () => {
		expect(buildSearchConditions({})).toEqual([]);
	});

	it("maps artist + genre_contains to MPD-compatible expression", () => {
		const conditions = buildSearchConditions({
			artist: "Aphex Twin",
			genre_contains: "electronic",
		});
		expect(conditions).toHaveLength(2);
		expect(conditions[0].operator).toBe(FilterCondition_Operator.EQUAL);
		expect(conditions[1].operator).toBe(FilterCondition_Operator.CONTAIN);
		const expression = convertConditionsToString(conditions);
		expect(expression).toContain('artist == "Aphex Twin"');
		expect(expression).toContain('genre contains "electronic"');
	});

	it("encodes added_since with ADDED_SINCE operator", () => {
		const conditions = buildSearchConditions({
			added_since: "2025-01-01T00:00:00Z",
		});
		expect(conditions).toHaveLength(1);
		expect(conditions[0].operator).toBe(FilterCondition_Operator.ADDED_SINCE);
		expect(convertConditionsToString(conditions)).toContain("added-since");
	});

	it("raises on unparseable added_since", () => {
		expect(() =>
			buildSearchConditions({ added_since: "not a date" }),
		).toThrowError(/added_since/);
	});
});
