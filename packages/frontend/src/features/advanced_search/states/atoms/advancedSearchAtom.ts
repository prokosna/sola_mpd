import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { ENV_ADVANCED_SEARCH_ENDPOINT } from "../../../../const/envs";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import { fetchAdvancedSearchStats } from "../../utils/advancedSearchUtils";
import { advancedSearchClientAtom } from "./advancedSearchClientAtom";

export const advancedSearchEndpointAtom = atom<string | undefined>(
	import.meta.env[ENV_ADVANCED_SEARCH_ENDPOINT],
);

const advancedSearchStatsAsyncAtom = atom(async (get) => {
	const client = get(advancedSearchClientAtom);
	const endpoint = get(advancedSearchEndpointAtom);
	if (endpoint === undefined) {
		return undefined;
	}
	try {
		return await fetchAdvancedSearchStats(client, endpoint);
	} catch (_) {
		return undefined;
	}
});

export const advancedSearchStatsAtom = atomWithSync(
	advancedSearchStatsAsyncAtom,
);

export const advancedSearchQueryLimitAtom = atomWithStorage(
	"advancedSearchQueryLimit",
	100,
	undefined,
	{ getOnInit: true },
);
