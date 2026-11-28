import { create } from "@bufbuild/protobuf";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { UpdateMode } from "../../../../../types/stateTypes";
import { browserStateAsyncAtom } from "../atoms/browserStateAtom";
import { browserStateRepositoryAtom } from "../atoms/browserStateRepositoryAtom";

import { updateBrowserStateActionAtom } from "./updateBrowserStateActionAtom";

function setup(save: () => Promise<void>) {
	const store = createStore();
	store.set(browserStateRepositoryAtom, { fetch: vi.fn(), save });
	const initial = create(BrowserStateSchema, {});
	store.set(browserStateAsyncAtom, initial);
	return { store, initial };
}

describe("updateBrowserStateActionAtom", () => {
	it("returns true and updates local state when the save succeeds", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);
		const next = create(BrowserStateSchema, {});

		const result = await store.set(updateBrowserStateActionAtom, {
			state: next,
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).toHaveBeenCalledWith(next);
		expect(store.get(browserStateAsyncAtom)).toBe(next);
	});

	it("returns false and leaves local state untouched when the save fails", async () => {
		const save = vi.fn(async () => {
			throw new Error("disk full");
		});
		const { store, initial } = setup(save);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await store.set(updateBrowserStateActionAtom, {
			state: create(BrowserStateSchema, {}),
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(false);
		expect(store.get(browserStateAsyncAtom)).toBe(initial);
		errorSpy.mockRestore();
	});

	it("returns true without saving when PERSIST is not requested", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);

		const result = await store.set(updateBrowserStateActionAtom, {
			state: create(BrowserStateSchema, {}),
			mode: UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).not.toHaveBeenCalled();
	});
});
