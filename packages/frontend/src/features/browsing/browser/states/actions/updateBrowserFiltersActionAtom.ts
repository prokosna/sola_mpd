import { clone } from "@bufbuild/protobuf";
import {
	type BrowserFilter,
	BrowserStateSchema,
} from "@sola_mpd/shared/src/models/browser_pb.js";
import { atom } from "jotai";

import type { UpdateMode } from "../../../../../types/stateTypes";
import {
	haveBrowserFilterTagsChanged,
	stripBrowserFilterSelection,
} from "../../../common/functions/browserFilter";
import { browserStateAtom } from "../atoms/browserStateAtom";
import { updateBrowserStateActionAtom } from "./updateBrowserStateActionAtom";

// Persists only the Workspace-owned tag/order structure. `selectedValues` and
// `selectedOrder` are a navigation position and live in the URL, which
// hooks/useUpdateBrowserFilters.ts handles alongside this action.
export const updateBrowserFiltersActionAtom = atom(
	null,
	async (get, set, args: { filters: BrowserFilter[]; mode: UpdateMode }) => {
		const { filters, mode } = args;
		const browserState = get(browserStateAtom);
		if (browserState === undefined) {
			return;
		}

		const structuralFilters = filters.map(stripBrowserFilterSelection);
		if (
			!haveBrowserFilterTagsChanged(browserState.filters, structuralFilters)
		) {
			// A pure selection change (add/remove a value, reset, etc.): nothing
			// structural to persist.
			return;
		}

		const newBrowserState = clone(BrowserStateSchema, browserState);
		newBrowserState.filters = structuralFilters;
		await set(updateBrowserStateActionAtom, { state: newBrowserState, mode });
	},
);
