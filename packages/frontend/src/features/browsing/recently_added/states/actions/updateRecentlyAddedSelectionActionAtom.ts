import { DEVICE_SETTING_KEY_RECENTLY_ADDED_LAST_POSITION } from "../../../../common";
import { RECENTLY_ADDED_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { createUpdateSelectionActionAtom } from "../../../common/states/actions/createUpdateSelectionActionAtom";

export const updateRecentlyAddedSelectionActionAtom =
	createUpdateSelectionActionAtom({
		selectionQueryParam: RECENTLY_ADDED_SELECTION_QUERY_PARAM,
		lastPositionSettingKey: DEVICE_SETTING_KEY_RECENTLY_ADDED_LAST_POSITION,
	});
