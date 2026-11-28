import { atom } from "jotai";

import { showNotification } from "../../../../lib/mantine/showNotification";
import { scanLibrary } from "../../functions/advancedSearchOperations";
import { advancedSearchEndpointAtom } from "../atoms/advancedSearchAtom";
import { advancedSearchClientAtom } from "../atoms/advancedSearchClientAtom";

export const scanLibraryActionAtom = atom(null, async (get, _set) => {
	const client = get(advancedSearchClientAtom);
	const endpoint = get(advancedSearchEndpointAtom);
	if (endpoint === undefined) {
		return;
	}
	try {
		await scanLibrary(client, endpoint);
	} catch (e) {
		console.error(e);
		showNotification({
			title: "Could not start library scan",
			description: e instanceof Error ? e.message : String(e),
			status: "error",
		});
		return;
	}
	showNotification({ title: "Library scan started", status: "success" });
});
