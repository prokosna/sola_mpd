import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { analyze } from "../../functions/advancedSearchOperations";
import { advancedSearchEndpointAtom } from "../atoms/advancedSearchAtom";
import { advancedSearchClientAtom } from "../atoms/advancedSearchClientAtom";

export const analyzeActionAtom = atom(null, async (get, _set) => {
	const client = get(advancedSearchClientAtom);
	const endpoint = get(advancedSearchEndpointAtom);
	if (endpoint === undefined) {
		return;
	}
	try {
		await analyze(client, endpoint);
	} catch (e) {
		console.error(e);
		showNotification({
			title: "Could not retry failed analysis",
			description: e instanceof Error ? e.message : String(e),
			status: "error",
		});
		return;
	}
	showNotification({ title: "Retrying failed analysis", status: "success" });
});
