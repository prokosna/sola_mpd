import { atom, createStore } from "jotai";
import { describe, expect, it } from "vitest";

import type { SelectionQueryParam } from "../../types/browserSelection";
import { createRememberSelectionActionAtom } from "./createRememberSelectionActionAtom";

function createFakeRememberedSelectionAtom(
	initial: SelectionQueryParam | undefined,
) {
	const base = atom(initial);
	return atom(
		(get) => get(base),
		(_get, set, value: SelectionQueryParam | undefined) => {
			set(base, value);
		},
	);
}

describe("createRememberSelectionActionAtom", () => {
	it("writes the selection into the remembered-selection atom", () => {
		const store = createStore();
		const rememberedSelectionAtom =
			createFakeRememberedSelectionAtom(undefined);
		const action = createRememberSelectionActionAtom({
			rememberedSelectionAtom,
		});

		store.set(action, { key: "bsel", value: "Rock" });

		expect(store.get(rememberedSelectionAtom)).toEqual({
			key: "bsel",
			value: "Rock",
		});
	});

	it("clears the remembered selection when given undefined", () => {
		const store = createStore();
		const rememberedSelectionAtom = createFakeRememberedSelectionAtom({
			key: "bsel",
			value: "Rock",
		});
		const action = createRememberSelectionActionAtom({
			rememberedSelectionAtom,
		});

		store.set(action, undefined);

		expect(store.get(rememberedSelectionAtom)).toBeUndefined();
	});
});
