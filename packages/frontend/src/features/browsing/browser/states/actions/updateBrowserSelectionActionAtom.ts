import { DEVICE_SETTING_KEY_BROWSER_LAST_POSITION } from "../../../../common/const/deviceSettingKeys";
import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { createUpdateSelectionActionAtom } from "../../../common/states/actions/createUpdateSelectionActionAtom";

export const updateBrowserSelectionActionAtom = createUpdateSelectionActionAtom(
	{
		selectionQueryParam: BROWSER_SELECTION_QUERY_PARAM,
		lastPositionSettingKey: DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
	},
);
