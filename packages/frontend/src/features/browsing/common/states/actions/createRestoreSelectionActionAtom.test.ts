import { atom, createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { VIEW_STATE_BLOB_QUERY_PARAM } from "../../const/browsingSelectionQueryParams";
import { encodeBrowserSelection } from "../../functions/serializeBrowserSelection";
import type { ViewStateBlobRepository } from "../../repositories/ViewStateBlobRepository";
import type { BrowserSelection } from "../../types/browserSelection";
import { viewStateBlobRepositoryAtom } from "../atoms/viewStateBlobRepositoryAtom";

import { createRestoreSelectionActionAtom } from "./createRestoreSelectionActionAtom";

const INLINE_PARAM = "bsel";

function selection(value: string): BrowserSelection {
	return [{ tag: 1, values: [value] }];
}

function payload(value: string): string {
	return encodeBrowserSelection(selection(value));
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => {
		resolve = r;
	});
	return { promise, resolve };
}

function setup() {
	const pending = new Map<string, ReturnType<typeof deferred<string>>>();
	const repository: ViewStateBlobRepository = {
		save: vi.fn(),
		fetch: vi.fn((token: string) => {
			const d = deferred<string>();
			pending.set(token, d);
			return d.promise;
		}),
	};
	const resolvedAtom = atom<BrowserSelection>([]);
	const loadingAtom = atom(false);
	const setLoadingAtom = atom(null, (_get, set, value: boolean) => {
		set(loadingAtom, value);
	});
	const restoreAtom = createRestoreSelectionActionAtom({
		selectionQueryParam: INLINE_PARAM,
		resolvedSelectionAtom: resolvedAtom,
		setIsLoadingActionAtom: setLoadingAtom,
	});
	const createConfiguredStore = () => {
		const s = createStore();
		s.set(viewStateBlobRepositoryAtom, repository);
		return s;
	};
	const store = createConfiguredStore();
	const restore = (search: string) => store.set(restoreAtom, search);
	return {
		store,
		restore,
		pending,
		resolvedAtom,
		loadingAtom,
		restoreAtom,
		createConfiguredStore,
	};
}

const tokenSearch = (token: string) =>
	`?${VIEW_STATE_BLOB_QUERY_PARAM}=${token}`;

describe("createRestoreSelectionActionAtom", () => {
	it("does not let a slow token overwrite a newer token", async () => {
		const { store, restore, pending, resolvedAtom } = setup();

		const first = restore(tokenSearch("a"));
		const second = restore(tokenSearch("b"));
		pending.get("b")?.resolve(payload("new"));
		await second;
		pending.get("a")?.resolve(payload("stale"));
		await first;

		expect(store.get(resolvedAtom)).toEqual(selection("new"));
	});

	it("does not let a slow token overwrite a newer inline selection", async () => {
		const { store, restore, pending, resolvedAtom, loadingAtom } = setup();

		const first = restore(tokenSearch("a"));
		await restore(`?${INLINE_PARAM}=${encodeURIComponent(payload("inline"))}`);
		pending.get("a")?.resolve(payload("stale"));
		await first;

		expect(store.get(resolvedAtom)).toEqual(selection("inline"));
		expect(store.get(loadingAtom)).toBe(false);
	});

	it("keeps loading raised while the newest token is still in flight", async () => {
		const { store, restore, pending, loadingAtom } = setup();

		const first = restore(tokenSearch("a"));
		const second = restore(tokenSearch("b"));
		pending.get("a")?.resolve(payload("stale"));
		await first;

		expect(store.get(loadingAtom)).toBe(true);
		pending.get("b")?.resolve(payload("new"));
		await second;
	});

	it("applies a token when it is the latest call", async () => {
		const { store, restore, pending, resolvedAtom } = setup();

		const call = restore(tokenSearch("a"));
		pending.get("a")?.resolve(payload("only"));
		await call;

		expect(store.get(resolvedAtom)).toEqual(selection("only"));
	});

	it("keeps in-flight state separate per store", async () => {
		const {
			store: storeA,
			restoreAtom,
			createConfiguredStore,
			pending,
			resolvedAtom,
			loadingAtom,
		} = setup();
		const storeB = createConfiguredStore();

		const inFlightA = storeA.set(restoreAtom, tokenSearch("a"));
		await storeB.set(
			restoreAtom,
			`?${INLINE_PARAM}=${encodeURIComponent(payload("inline"))}`,
		);

		expect(storeB.get(resolvedAtom)).toEqual(selection("inline"));
		expect(storeA.get(loadingAtom)).toBe(true);

		const inFlightB = storeB.set(restoreAtom, tokenSearch("b"));
		await storeA.set(
			restoreAtom,
			`?${INLINE_PARAM}=${encodeURIComponent(payload("inlineA"))}`,
		);
		pending.get("b")?.resolve(payload("resultB"));
		await inFlightB;
		pending.get("a")?.resolve(payload("stale"));
		await inFlightA;

		expect(storeB.get(resolvedAtom)).toEqual(selection("resultB"));
		expect(storeA.get(resolvedAtom)).toEqual(selection("inlineA"));
		expect(storeA.get(loadingAtom)).toBe(false);
	});
});
