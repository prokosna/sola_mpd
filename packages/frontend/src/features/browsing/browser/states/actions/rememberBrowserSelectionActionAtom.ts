import { createRememberSelectionActionAtom } from "../../../common/states/actions/createRememberSelectionActionAtom";
import { rememberedBrowserSelectionAtom } from "../atoms/rememberedBrowserSelectionAtom";

export const rememberBrowserSelectionActionAtom =
	createRememberSelectionActionAtom({
		rememberedSelectionAtom: rememberedBrowserSelectionAtom,
	});
