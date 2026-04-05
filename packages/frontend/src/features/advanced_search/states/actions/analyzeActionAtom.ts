import { atom } from "jotai";

import { analyze } from "../../utils/advancedSearchUtils";
import { advancedSearchEndpointAtom } from "../atoms/advancedSearchAtom";
import { advancedSearchClientAtom } from "../atoms/advancedSearchClientAtom";

export const analyzeActionAtom = atom(null, (get, _set) => {
	const client = get(advancedSearchClientAtom);
	const endpoint = get(advancedSearchEndpointAtom);
	if (endpoint === undefined) {
		return;
	}
	analyze(client, endpoint);
});
