import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import type { ViewStateBlobRepository } from "../../../common/repositories/ViewStateBlobRepository";
import { viewStateBlobRepositoryAtom } from "../../../common/states/atoms/viewStateBlobRepositoryAtom";
import { resolvedRecentlyAddedSelectionAtom } from "../atoms/recentlyAddedSelectionAtom";

import { restoreRecentlyAddedSelectionActionAtom } from "./restoreRecentlyAddedSelectionActionAtom";

function createFakeViewStateBlobRepository(
	overrides: Partial<ViewStateBlobRepository> = {},
): ViewStateBlobRepository {
	return {
		save: vi.fn(async () => "token"),
		fetch: vi.fn(async () => undefined),
		...overrides,
	};
}

describe("restoreRecentlyAddedSelectionActionAtom", () => {
	it("falls back to an empty selection, without throwing, when the token repository rejects (404)", async () => {
		const store = createStore();
		const repository = createFakeViewStateBlobRepository({
			fetch: vi.fn(async () => {
				throw new Error("404 Not Found");
			}),
		});
		store.set(viewStateBlobRepositoryAtom, repository);

		await store.set(restoreRecentlyAddedSelectionActionAtom, "?vs=deadbeef");

		expect(store.get(resolvedRecentlyAddedSelectionAtom)).toEqual([]);
	});
});
