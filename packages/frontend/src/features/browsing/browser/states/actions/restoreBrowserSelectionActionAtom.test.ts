import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { encodeBrowserSelection } from "../../../common/functions/serializeBrowserSelection";
import type { ViewStateBlobRepository } from "../../../common/repositories/ViewStateBlobRepository";
import { viewStateBlobRepositoryAtom } from "../../../common/states/atoms/viewStateBlobRepositoryAtom";
import { resolvedBrowserSelectionAtom } from "../atoms/browserSelectionAtom";
import { isBrowserLoadingAtom } from "../atoms/browserUiAtom";

import { restoreBrowserSelectionActionAtom } from "./restoreBrowserSelectionActionAtom";

function createFakeViewStateBlobRepository(
	overrides: Partial<ViewStateBlobRepository> = {},
): ViewStateBlobRepository {
	return {
		save: vi.fn(async () => "token"),
		fetch: vi.fn(async () => undefined),
		...overrides,
	};
}

describe("restoreBrowserSelectionActionAtom", () => {
	it("falls back to an empty selection, without throwing, when the token repository rejects (404)", async () => {
		const store = createStore();
		const repository = createFakeViewStateBlobRepository({
			fetch: vi.fn(async () => {
				throw new Error("404 Not Found");
			}),
		});
		store.set(viewStateBlobRepositoryAtom, repository);

		await expect(
			store.set(restoreBrowserSelectionActionAtom, "?vs=deadbeef"),
		).resolves.toEqual({});

		expect(store.get(resolvedBrowserSelectionAtom)).toEqual([]);
	});

	it("falls back to an empty selection when the repository resolves undefined (unknown token)", async () => {
		const store = createStore();
		store.set(viewStateBlobRepositoryAtom, createFakeViewStateBlobRepository());

		await store.set(restoreBrowserSelectionActionAtom, "?vs=unknown");

		expect(store.get(resolvedBrowserSelectionAtom)).toEqual([]);
	});

	it("raises the browser loading state while a token is resolving", async () => {
		const store = createStore();
		let resolveFetch: (value: string | undefined) => void = () => {};
		const repository = createFakeViewStateBlobRepository({
			fetch: vi.fn(
				() =>
					new Promise<string | undefined>((resolve) => {
						resolveFetch = resolve;
					}),
			),
		});
		store.set(viewStateBlobRepositoryAtom, repository);
		store.set(isBrowserLoadingAtom, false);

		const promise = store.set(restoreBrowserSelectionActionAtom, "?vs=abc");
		expect(store.get(isBrowserLoadingAtom)).toBe(true);
		resolveFetch(undefined);
		await promise;
	});

	it("resolves an inline selection synchronously, without touching the repository", async () => {
		const store = createStore();
		const repository = createFakeViewStateBlobRepository();
		store.set(viewStateBlobRepositoryAtom, repository);

		const value = encodeBrowserSelection([
			{ tag: Song_MetadataTag.ARTIST, values: ["Beatles"] },
		]);
		const params = new URLSearchParams();
		params.set(BROWSER_SELECTION_QUERY_PARAM, value);

		const result = await store.set(
			restoreBrowserSelectionActionAtom,
			`?${params.toString()}`,
		);

		expect(result).toEqual({});
		expect(repository.fetch).not.toHaveBeenCalled();
	});
});
