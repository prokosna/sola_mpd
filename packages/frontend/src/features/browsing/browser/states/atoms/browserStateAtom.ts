import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import { atomWithDefault } from "jotai/utils";

import { atomWithSync } from "../../../../../lib/jotai/atomWithSync";

import { browserStateRepositoryAtom } from "./browserStateRepositoryAtom";

export const browserStateAsyncAtom = atomWithDefault<
	Promise<BrowserState> | BrowserState
>(async (get) => {
	const repository = get(browserStateRepositoryAtom);
	return await repository.fetch();
});

export const browserStateAtom = atomWithSync(browserStateAsyncAtom);
