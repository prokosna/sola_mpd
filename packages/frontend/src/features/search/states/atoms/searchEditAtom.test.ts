import { create } from "@bufbuild/protobuf";
import {
	SavedSearchesSchema,
	SearchSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";

import { savedSearchesAsyncAtom } from "./savedSearchesAtom";
import {
	editingSearchNameAtom,
	selectedSavedSearchNameAtom,
} from "./searchEditAtom";

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function createReadyStore(names: string[]) {
	const store = createStore();
	store.set(
		savedSearchesAsyncAtom,
		Promise.resolve(
			create(SavedSearchesSchema, {
				searches: names.map((name) => create(SearchSchema, { name })),
			}),
		),
	);
	store.get(selectedSavedSearchNameAtom); // primes the async->sync unwrap
	await flush();
	return store;
}

describe("selectedSavedSearchNameAtom", () => {
	it("names the saved search the editor holds", async () => {
		const store = await createReadyStore(["Rock", "Jazz"]);

		store.set(editingSearchNameAtom, "Jazz");

		expect(store.get(selectedSavedSearchNameAtom)).toBe("Jazz");
	});

	it("names nothing while the editor holds a name that is not saved", async () => {
		const store = await createReadyStore(["Rock"]);

		store.set(editingSearchNameAtom, "New Search");

		expect(store.get(selectedSavedSearchNameAtom)).toBeUndefined();
	});

	// Saving under a new name has to highlight it without the save path
	// touching the selection.
	it("follows a name that becomes saved", async () => {
		const store = await createReadyStore(["Rock"]);
		store.set(editingSearchNameAtom, "Jazz");
		expect(store.get(selectedSavedSearchNameAtom)).toBeUndefined();

		store.set(
			savedSearchesAsyncAtom,
			create(SavedSearchesSchema, {
				searches: ["Rock", "Jazz"].map((name) =>
					create(SearchSchema, { name }),
				),
			}),
		);
		await flush();

		expect(store.get(selectedSavedSearchNameAtom)).toBe("Jazz");
	});

	it("drops a name that stops being saved", async () => {
		const store = await createReadyStore(["Rock", "Jazz"]);
		store.set(editingSearchNameAtom, "Jazz");

		store.set(
			savedSearchesAsyncAtom,
			create(SavedSearchesSchema, {
				searches: [create(SearchSchema, { name: "Rock" })],
			}),
		);
		await flush();

		expect(store.get(selectedSavedSearchNameAtom)).toBeUndefined();
	});
});
