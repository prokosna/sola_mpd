import { clone } from "@bufbuild/protobuf";
import {
	type BrowserFilter,
	BrowserStateSchema,
} from "@sola_mpd/shared/src/models/browser_pb.js";
import { atom } from "jotai";

import type { UpdateMode } from "../../../../../types/stateTypes";
import { browserStateAtom } from "../atoms/browserStateAtom";
import { updateBrowserStateActionAtom } from "./updateBrowserStateActionAtom";

export const updateBrowserFiltersActionAtom = atom(
	null,
	async (get, set, args: { filters: BrowserFilter[]; mode: UpdateMode }) => {
		const { filters, mode } = args;
		const browserState = get(browserStateAtom);
		if (browserState === undefined) {
			return;
		}
		const newBrowserState = clone(BrowserStateSchema, browserState);
		newBrowserState.filters = filters;
		await set(updateBrowserStateActionAtom, { state: newBrowserState, mode });
	},
);
