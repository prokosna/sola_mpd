import { create } from "@bufbuild/protobuf";
import { MpdProfileStateSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { UpdateMode } from "../../../../types/stateTypes";
import { mpdProfileStateAsyncAtom } from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

import { updateMpdProfileStateActionAtom } from "./updateMpdProfileStateActionAtom";

function setup(save: () => Promise<void>) {
	const store = createStore();
	store.set(mpdProfileStateRepositoryAtom, { fetch: vi.fn(), save });
	const initial = create(MpdProfileStateSchema, {});
	store.set(mpdProfileStateAsyncAtom, Promise.resolve(initial));
	return { store, initial };
}

describe("updateMpdProfileStateActionAtom", () => {
	it("returns true and updates local state when the save succeeds", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);
		const next = create(MpdProfileStateSchema, {});

		const result = await store.set(updateMpdProfileStateActionAtom, {
			state: next,
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).toHaveBeenCalledWith(next);
		expect(await store.get(mpdProfileStateAsyncAtom)).toBe(next);
	});

	it("returns false and leaves local state untouched when the save fails", async () => {
		const save = vi.fn(async () => {
			throw new Error("disk full");
		});
		const { store, initial } = setup(save);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await store.set(updateMpdProfileStateActionAtom, {
			state: create(MpdProfileStateSchema, {}),
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(false);
		expect(await store.get(mpdProfileStateAsyncAtom)).toBe(initial);
		errorSpy.mockRestore();
	});

	it("returns true without saving when PERSIST is not requested", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);

		const result = await store.set(updateMpdProfileStateActionAtom, {
			state: create(MpdProfileStateSchema, {}),
			mode: UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).not.toHaveBeenCalled();
	});
});
