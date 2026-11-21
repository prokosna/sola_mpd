import { describe, expect, it } from "vitest";

import { selectProfileScopedState } from "./profileScopedState";

const initial = { value: 0 };

describe("selectProfileScopedState", () => {
	it("returns the stored state when the profile names match", () => {
		const state = { value: 3 };
		expect(
			selectProfileScopedState({ profileName: "a", state }, "a", initial),
		).toBe(state);
	});

	it("returns the initial state when the profile names differ", () => {
		expect(
			selectProfileScopedState(
				{ profileName: "a", state: { value: 3 } },
				"b",
				initial,
			),
		).toBe(initial);
	});

	it("returns the initial state when there is no current profile", () => {
		expect(
			selectProfileScopedState(
				{ profileName: "a", state: { value: 3 } },
				undefined,
				initial,
			),
		).toBe(initial);
	});

	it("returns the initial state when nothing is stored", () => {
		expect(selectProfileScopedState(undefined, "a", initial)).toBe(initial);
	});
});
