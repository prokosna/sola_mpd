import { create } from "@bufbuild/protobuf";
import { useForm } from "@mantine/form";
import {
	SavedSearchesSchema,
	SearchSchema,
} from "@sola_mpd/shared/src/models/search_pb.js";
import { act, renderHook } from "@testing-library/react";
import { createStore } from "jotai";
import { Provider } from "jotai/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import type { SavedSearchesRepository } from "../repositories/SavedSearchesRepository";
import {
	savedSearchesAsyncAtom,
	savedSearchesAtom,
} from "../states/atoms/savedSearchesAtom";
import { savedSearchesRepositoryAtom } from "../states/atoms/savedSearchesRepositoryAtom";
import { editingSearchStatusAtom } from "../states/atoms/searchEditAtom";
import {
	EditingSearchStatus,
	type SearchFormValues,
} from "../types/searchTypes";
import { useSearchQueryEditorHandlers } from "./useSearchQueryEditorHandlers";

vi.mock("../../../lib/mantine/showNotification", () => ({
	showNotification: vi.fn(),
}));

async function setup(save: SavedSearchesRepository["save"]) {
	const original = create(SavedSearchesSchema, {
		searches: [create(SearchSchema, { name: "a" })],
	});
	const store = createStore();
	store.set(savedSearchesRepositoryAtom, { fetch: vi.fn(), save });
	store.set(savedSearchesAsyncAtom, Promise.resolve(original));
	store.set(editingSearchStatusAtom, EditingSearchStatus.NOT_SAVED);
	store.get(savedSearchesAtom);
	await new Promise((resolve) => setTimeout(resolve, 0));
	const initialValues: SearchFormValues = { name: "b", queries: [] };
	const { result } = renderHook(
		() => useSearchQueryEditorHandlers(useForm({ initialValues })),
		{ wrapper: ({ children }) => createElement(Provider, { store }, children) },
	);
	return { store, original, result, initialValues };
}

describe("useSearchQueryEditorHandlers handleSave", () => {
	it("marks the search as saved when persisting succeeds", async () => {
		const { store, original, result, initialValues } = await setup(
			vi.fn(async () => {}),
		);

		await act(async () => {
			await result.current.handleSave(initialValues);
		});

		expect(store.get(editingSearchStatusAtom)).toBe(EditingSearchStatus.SAVED);
		expect(original.searches.map((s) => s.name)).toEqual(["a"]);
	});

	it("leaves the atom's search list and editing status alone when persisting fails", async () => {
		const { store, original, result, initialValues } = await setup(
			vi.fn(async () => {
				throw new Error("save failed");
			}),
		);
		vi.spyOn(console, "error").mockImplementation(() => {});

		await act(async () => {
			await result.current.handleSave(initialValues);
		});

		expect(original.searches.map((s) => s.name)).toEqual(["a"]);
		expect(store.get(editingSearchStatusAtom)).toBe(
			EditingSearchStatus.NOT_SAVED,
		);
	});
});
