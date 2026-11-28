import { create } from "@bufbuild/protobuf";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { UpdateMode } from "../../../../../types/stateTypes";
import { recentlyAddedStateAsyncAtom } from "../atoms/recentlyAddedStateAtom";
import { recentlyAddedStateRepositoryAtom } from "../atoms/recentlyAddedStateRepositoryAtom";

import { updateRecentlyAddedStateActionAtom } from "./updateRecentlyAddedStateActionAtom";

function setup(save: () => Promise<void>) {
	const store = createStore();
	store.set(recentlyAddedStateRepositoryAtom, { fetch: vi.fn(), save });
	const initial = create(RecentlyAddedStateSchema, {});
	store.set(recentlyAddedStateAsyncAtom, initial);
	return { store, initial };
}

describe("updateRecentlyAddedStateActionAtom", () => {
	it("returns true and updates local state when the save succeeds", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);
		const next = create(RecentlyAddedStateSchema, {});

		const result = await store.set(updateRecentlyAddedStateActionAtom, {
			state: next,
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).toHaveBeenCalledWith(next);
		expect(store.get(recentlyAddedStateAsyncAtom)).toBe(next);
	});

	it("returns false and leaves local state untouched when the save fails", async () => {
		const save = vi.fn(async () => {
			throw new Error("disk full");
		});
		const { store, initial } = setup(save);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await store.set(updateRecentlyAddedStateActionAtom, {
			state: create(RecentlyAddedStateSchema, {}),
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(false);
		expect(store.get(recentlyAddedStateAsyncAtom)).toBe(initial);
		errorSpy.mockRestore();
	});

	it("returns true without saving when PERSIST is not requested", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);

		const result = await store.set(updateRecentlyAddedStateActionAtom, {
			state: create(RecentlyAddedStateSchema, {}),
			mode: UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).not.toHaveBeenCalled();
	});
});
