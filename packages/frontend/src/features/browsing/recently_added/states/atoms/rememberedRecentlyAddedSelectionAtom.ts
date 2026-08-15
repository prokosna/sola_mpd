import { DEVICE_SETTING_KEY_RECENTLY_ADDED_SELECTION } from "../../../../common";
import { createRememberedSelectionAtom } from "../../../common/states/atoms/rememberedSelectionAtom";

/** The Recently Added page's last selection query param, remembered across visits. */
export const rememberedRecentlyAddedSelectionAtom =
	createRememberedSelectionAtom(DEVICE_SETTING_KEY_RECENTLY_ADDED_SELECTION);
