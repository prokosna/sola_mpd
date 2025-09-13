import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";
import { ENV_ADVANCED_SEARCH_ENDPOINT } from "../../../const/envs";
import { atomWithSync } from "../../../lib/jotai/atomWithSync";
import { fetchAdvancedSearchStats } from "../utils/advancedSearchUtils";
import { advancedSearchClientAtom } from "./advancedSearchClient";

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

const advancedSearchStatsAtom = atomWithSync(advancedSearchStatsAsyncAtom);

/**
 * Atom for storing advanced search query limit.
 */
export const advancedSearchQueryLimitAtom = atomWithStorage(
	"advancedSearchQueryLimit",
	100,
	undefined,
	{ getOnInit: true },
);

/**
 * Hook for accessing the advanced search stats.
 *
 * @returns The current advanced search stats
 */
export function useAdvancedSearchStatsState() {
	return useAtomValue(advancedSearchStatsAtom);
}

/**
 * Hook for accessing the advanced search query limit.
 *
 * @returns The current advanced search query limit
 */
export function useAdvancedSearchQueryLimitState() {
	return useAtomValue(advancedSearchQueryLimitAtom);
}

export function useSetAdvancedSearchQueryLimitState() {
	const setAdvancedSearchQueryLimit = useSetAtom(advancedSearchQueryLimitAtom);
	return useCallback(
		(limit: number) => {
			setAdvancedSearchQueryLimit(limit);
		},
		[setAdvancedSearchQueryLimit],
	);
}
