import { atom, createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { atomWithSync } from "./atomWithSync";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("atomWithSync", () => {
	it("returns the resolved value", async () => {
		const baseAtom = atom(async () => "songs");
		const syncAtom = atomWithSync(baseAtom, vi.fn());
		const store = createStore();
		store.sub(syncAtom, () => {});

		await flush();

		expect(store.get(syncAtom)).toBe("songs");
	});

	it("keeps the previous value and reports the error when a reload fails", async () => {
		const resultAtom = atom<"ok" | "fail">("ok");
		const baseAtom = atom(async (get) => {
			if (get(resultAtom) === "fail") {
				throw new Error("timed out");
			}
			return "songs";
		});
		const onRejected = vi.fn();
		const syncAtom = atomWithSync(baseAtom, onRejected);
		const store = createStore();
		store.sub(syncAtom, () => {});
		await flush();

		store.set(resultAtom, "fail");
		await flush();

		expect(store.get(syncAtom)).toBe("songs");
		expect(onRejected).toHaveBeenCalledWith(new Error("timed out"));
	});

	it("updates again once a later load succeeds after a failure", async () => {
		const resultAtom = atom<"fail" | "ok">("fail");
		const baseAtom = atom(async (get) => {
			if (get(resultAtom) === "fail") {
				throw new Error("timed out");
			}
			return "songs";
		});
		const syncAtom = atomWithSync(baseAtom, vi.fn());
		const store = createStore();
		store.sub(syncAtom, () => {});
		await flush();

		store.set(resultAtom, "ok");
		await flush();

		expect(store.get(syncAtom)).toBe("songs");
	});

	it("stays undefined without throwing when the first load fails", async () => {
		const baseAtom = atom(async (): Promise<string> => {
			throw new Error("timed out");
		});
		const onRejected = vi.fn();
		const syncAtom = atomWithSync(baseAtom, onRejected);
		const store = createStore();
		store.sub(syncAtom, () => {});

		await flush();

		expect(store.get(syncAtom)).toBeUndefined();
		expect(onRejected).toHaveBeenCalledTimes(1);
	});
});
