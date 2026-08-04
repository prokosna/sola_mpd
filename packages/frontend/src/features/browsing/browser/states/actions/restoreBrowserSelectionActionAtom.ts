import { DEVICE_SETTING_KEY_BROWSER_LAST_POSITION } from "../../../../common/const/deviceSettingKeys";
import { BROWSER_SELECTION_QUERY_PARAM } from "../../../common/const/browsingSelectionQueryParams";
import { createRestoreSelectionActionAtom } from "../../../common/states/actions/createRestoreSelectionActionAtom";
import { resolvedBrowserSelectionAtom } from "../atoms/browserSelectionAtom";
import { setIsBrowserLoadingActionAtom } from "./setIsBrowserLoadingActionAtom";

export const restoreBrowserSelectionActionAtom =
	createRestoreSelectionActionAtom({
		selectionQueryParam: BROWSER_SELECTION_QUERY_PARAM,
		lastPositionSettingKey: DEVICE_SETTING_KEY_BROWSER_LAST_POSITION,
		resolvedSelectionAtom: resolvedBrowserSelectionAtom,
		setIsLoadingActionAtom: setIsBrowserLoadingActionAtom,
	});
