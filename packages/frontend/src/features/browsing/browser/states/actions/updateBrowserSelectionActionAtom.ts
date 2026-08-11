import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { createUpdateSelectionActionAtom } from "../../../common/states/actions/createUpdateSelectionActionAtom";

export const updateBrowserSelectionActionAtom = createUpdateSelectionActionAtom(
	{
		selectionQueryParam: BROWSER_SELECTION_QUERY_PARAM,
	},
);
