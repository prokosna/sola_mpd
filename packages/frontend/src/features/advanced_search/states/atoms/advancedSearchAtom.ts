import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { ENV_ADVANCED_SEARCH_ENDPOINT } from "../../../../const/envs";
import { atomWithSync } from "../../../../lib/jotai/atomWithSync";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_ADVANCED_SEARCH_QUERY_LIMIT,
} from "../../../common";
import { fetchAdvancedSearchStats } from "../../functions/advancedSearchOperations";
import {
	DEFAULT_QUERY_LIMIT,
	parseQueryLimit,
} from "../../functions/queryLimit";
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

const queryLimitStorage = createJSONStorage<number>();

export const advancedSearchQueryLimitAtom = atomWithStorage<number>(
	buildDeviceSettingKey(DEVICE_SETTING_KEY_ADVANCED_SEARCH_QUERY_LIMIT),
	DEFAULT_QUERY_LIMIT,
	{
		...queryLimitStorage,
		getItem: (key, initialValue) =>
			parseQueryLimit(queryLimitStorage.getItem(key, initialValue)) ??
			initialValue,
	},
	{ getOnInit: true },
);
