import { DEVICE_SETTING_KEY_BROWSER_SELECTION } from "../../../../common";
import { createRememberedSelectionAtom } from "../../../common/states/atoms/rememberedSelectionAtom";

/** The Browser page's last selection query param, remembered across visits. */
export const rememberedBrowserSelectionAtom = createRememberedSelectionAtom(
	DEVICE_SETTING_KEY_BROWSER_SELECTION,
);
