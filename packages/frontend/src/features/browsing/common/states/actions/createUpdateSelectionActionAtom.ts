import { atom } from "jotai";

import { showNotification } from "../../../../../lib/mantine/showNotification";
import { VIEW_STATE_BLOB_QUERY_PARAM } from "../../const/browsingSelectionQueryParams";
import { serializeBrowserSelection } from "../../functions/serializeBrowserSelection";
import type {
	BrowserSelection,
	SelectionQueryParam,
} from "../../types/browserSelection";
import { viewStateBlobRepositoryAtom } from "../atoms/viewStateBlobRepositoryAtom";

/**
 * Builds the action that turns a navigation position into the query param the
 * caller should apply to the URL (`undefined` clears it), saving to a View
 * State Blob when the serialized selection is too long to inline.
 *
 * The only place that writes to ViewStateBlobRepository.
 */
export function createUpdateSelectionActionAtom(config: {
	selectionQueryParam: string;
}) {
	const { selectionQueryParam } = config;

	return atom(
		null,
		async (
			get,
			_set,
			selection: BrowserSelection,
		): Promise<SelectionQueryParam | undefined> => {
			if (selection.length === 0) {
				return undefined;
			}

			const serialized = serializeBrowserSelection(selection);
			if (serialized.kind === "inline") {
				return { key: selectionQueryParam, value: serialized.value };
			}

			try {
				const token = await get(viewStateBlobRepositoryAtom).save(
					serialized.payload,
				);
				return { key: VIEW_STATE_BLOB_QUERY_PARAM, value: token };
			} catch (e) {
				console.error(e);
				showNotification({
					title: "Could not save browsing position",
					description: e instanceof Error ? e.message : String(e),
					status: "error",
				});
				return undefined;
			}
		},
	);
}
