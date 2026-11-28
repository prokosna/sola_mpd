import { create } from "@bufbuild/protobuf";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { UpdateMode } from "../../../../types/stateTypes";
import { pluginAsyncAtom } from "../atoms/pluginAtom";
import { pluginStateRepositoryAtom } from "../atoms/pluginStateRepositoryAtom";

import { updatePluginActionAtom } from "./updatePluginActionAtom";

function setup(save: () => Promise<void>) {
	const store = createStore();
	store.set(pluginStateRepositoryAtom, { fetch: vi.fn(), save });
	const initial = create(PluginStateSchema, {});
	store.set(pluginAsyncAtom, initial);
	return { store, initial };
}

describe("updatePluginActionAtom", () => {
	it("returns true and updates local state when the save succeeds", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);
		const next = create(PluginStateSchema, {});

		const result = await store.set(updatePluginActionAtom, {
			pluginState: next,
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).toHaveBeenCalledWith(next);
		expect(store.get(pluginAsyncAtom)).toBe(next);
	});

	it("returns false and leaves local state untouched when the save fails", async () => {
		const save = vi.fn(async () => {
			throw new Error("disk full");
		});
		const { store, initial } = setup(save);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await store.set(updatePluginActionAtom, {
			pluginState: create(PluginStateSchema, {}),
			mode: UpdateMode.PERSIST | UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(false);
		expect(store.get(pluginAsyncAtom)).toBe(initial);
		errorSpy.mockRestore();
	});

	it("returns true without saving when PERSIST is not requested", async () => {
		const save = vi.fn(async () => {});
		const { store } = setup(save);

		const result = await store.set(updatePluginActionAtom, {
			pluginState: create(PluginStateSchema, {}),
			mode: UpdateMode.LOCAL_STATE,
		});

		expect(result).toBe(true);
		expect(save).not.toHaveBeenCalled();
	});
});
