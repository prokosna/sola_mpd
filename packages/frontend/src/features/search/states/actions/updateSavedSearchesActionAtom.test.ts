import { create } from "@bufbuild/protobuf";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { UpdateMode } from "../../../../types/stateTypes";
import { savedSearchesAsyncAtom } from "../atoms/savedSearchesAtom";
import { savedSearchesRepositoryAtom } from "../atoms/savedSearchesRepositoryAtom";

import { updateSavedSearchesActionAtom } from "./updateSavedSearchesActionAtom";

function setup(save: () => Promise<void>) {
	const store = createStore();
	store.set(savedSearchesRepositoryAtom, { fetch: vi.fn(), save });
	const initial = create(SavedSearchesSchema, {});
	store.set(savedSearchesAsyncAtom, initial);
	return { store, initial };
}

describe("updateSavedSearchesActionAtom", () => {
	it("returns true and updates local state when the save succeeds", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);
		const next = create(SavedSearchesSchema, {});

		const result = await store.set(updateSavedSearchesActionAtom, {
			savedSearches: next,
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).toHaveBeenCalledWith(next);
		expect(store.get(savedSearchesAsyncAtom)).toBe(next);
	});

	it("returns false and leaves local state untouched when the save fails", async () => {
		const save = vi.fn(async () => {
			throw new Error("disk full");
		});
		const { store, initial } = setup(save);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await store.set(updateSavedSearchesActionAtom, {
			savedSearches: create(SavedSearchesSchema, {}),
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(false);
		expect(store.get(savedSearchesAsyncAtom)).toBe(initial);
		errorSpy.mockRestore();
	});

	it("returns true without saving when PERSIST is not requested", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);

		const result = await store.set(updateSavedSearchesActionAtom, {
			savedSearches: create(SavedSearchesSchema, {}),
			mode: UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).not.toHaveBeenCalled();
	});
});
